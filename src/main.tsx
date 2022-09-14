import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/reset.css';
import './styles/colors.css';
import './styles/classes.css';
import './styles/theme.ts';

import { injectedScriptEventData, BgScriptPortMessage, State } from './utils/types';
import { getValue, setValue } from './utils/storage';
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

		(Object.keys(defaultStorage) as (keyof typeof defaultStorage)[]).forEach((key) => {
			if (storage[key] === undefined) {
				// @ts-ignore
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
			chrome.tabs.sendMessage(tabIdToInteractWith, { type: 'disconnect' }).catch((e) => {});
		};

		const state: Partial<State> = {
			...storage,
			chromePort,
			i18n: i18nDict[storage.language!],
			activeNetwork: storage.networkList![storage.activeNetworkIndex!],
			sendBgScriptPortMessage: (message: BgScriptPortMessage) => chromePort.postMessage(message),
			triggerInjectedScriptEvent: async (event: injectedScriptEventData) => {
				// @ts-ignore
				chrome.tabs.sendMessage(tabIdToInteractWith, event).catch((e) => {});
			},
		};

		if (message.secrets) {
			state.activeAccount = wallet.deriveAddress({
				...message.secrets,
				index: state.activeAccountIndex!,
			});
			state.secrets = message.secrets;
			state.sendBgScriptPortMessage!({ type: 'reopen' });
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
