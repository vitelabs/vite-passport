import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/reset.css';
import './styles/colors.css';
import './styles/classes.css';
import './styles/theme.ts';

import { injectedScriptEventData, BgScriptPortMessage, State } from './utils/types';
import { getValue, removeKeys, setValue } from './utils/storage';
import { wallet } from '@vite/vitejs';
import { defaultStorage, i18nDict } from './utils/constants';
import { getCurrentTab } from './utils/misc';
import { parseQueryString } from './utils/strings';

const root = createRoot(document.getElementById('root')!);

const chromePort = chrome.runtime.connect();
const listen = async (message: BgScriptPortMessage) => {
	if (message.type === 'opening') {
		chromePort.onMessage.removeListener(listen);
		const storage = await getValue(null);

		Object.keys(storage).forEach((key) => {
			if (!(key in defaultStorage)) {
				removeKeys(key);
			}
		});
		Object.keys(defaultStorage).forEach((key) => {
			if (storage[key] === undefined) {
				storage[key] = defaultStorage[key];
				setValue({ [key]: defaultStorage[key] });
			}
		});

		// originTabId is the id of the tab that caused the confirmation.html popup to open
		const originTabId = window.location.search
			? +parseQueryString(window.location.search)?.originTabId
			: undefined;
		const tabIdToInteractWith = originTabId || (await getCurrentTab()).id!;

		window.onbeforeunload = () => {
			// this rejects any pending promises in injectedScript.ts
			// @ts-ignore
			chrome.tabs.sendMessage(tabIdToInteractWith, { type: 'disconnect' }).catch(() => {});
		};

		const state: Partial<State> = {
			...defaultStorage,
			...storage,
			chromePort,
			i18n: i18nDict[storage.language!],
			activeNetwork: storage.networkList![storage.activeNetworkIndex!],
			sendBgScriptPortMessage: (message: BgScriptPortMessage) => chromePort.postMessage(message),
			triggerInjectedScriptEvent: async (event: injectedScriptEventData) => {
				// @ts-ignore
				chrome.tabs.sendMessage(tabIdToInteractWith, event).catch(() => {});
			},
		};

		if (message.secrets) {
			state.activeAccount = wallet.deriveAddress({
				...message.secrets,
				index: state.activeAccountIndex!,
			});
			state.secrets = message.secrets;
			state.sendBgScriptPortMessage!({ type: 'reopen' });
			// NOTE: eventually this `if` block can be deleted. It's necessary now for
			// the users of v1.0.4 and before when derivedAddresses didn't exist
			if (!storage.derivedAddresses) {
				const addressEndIndex = storage.activeAccountIndex || defaultStorage.activeAccountIndex;
				const derivedAddresses: string[] = [];
				for (let i = 0; i <= addressEndIndex; i++) {
					derivedAddresses.push(wallet.deriveAddress({ ...message.secrets, index: i }).address);
				}
				state.derivedAddresses = derivedAddresses;
				setValue({ derivedAddresses });
			}
		}

		root.render(
			// https://stackoverflow.com/a/65167384/13442719
			// <React.StrictMode>
			<App initialState={state} />
			// <p className="">test</p>
			// </React.StrictMode>
		);
	}
};
chromePort.onMessage.addListener(listen);
