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

		const state: Partial<State> = {
			...storage,
			chromePort,
			i18n: i18nDict[storage.language!],
			activeNetwork: storage.networkList![storage.activeNetworkIndex!],
			sendBgScriptPortMessage: (message: BgScriptPortMessage) => chromePort.postMessage(message),
			triggerInjectedScriptEvent: async (event: injectedScriptEventData) => {
				console.log('event:', event);
				const tab = await getCurrentTab();
				chrome.tabs.sendMessage(tab.id!, event);
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

		// For when `openPopup` is called from background.ts. Don't want to have multiple popup windows or a transaction waiting to be confirmed in the background. This is consistent behavior anyways with the popup window that opens when you click the icon.
		// window.onblur = window.close;
		// This also makes debugging with inspect impossible...

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
