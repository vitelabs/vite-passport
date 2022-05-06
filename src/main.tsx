// import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/reset.css';
import './styles/colors.css';
import './styles/classes.css';
import './styles/theme.ts';

import { PortMessage, State } from './utils/types';
import { getValue } from './utils/storage';
import { wallet } from '@vite/vitejs';
import { i18nDict, storageDefaults } from './utils/constants';

const root = createRoot(document.getElementById('root')!);

const chromePort = chrome.runtime.connect();
const listen = async (message: PortMessage) => {
	if (message.type === 'opening') {
		chromePort.onMessage.removeListener(listen);
		const {
			encryptedSecrets,
			language = storageDefaults.language,
			networkUrl = storageDefaults.networkUrl,
			networks = storageDefaults.networks,
			currencyConversion = storageDefaults.currencyConversion,
			activeAccountIndex = storageDefaults.activeAccountIndex,
		} = await getValue(null);

		const state: Partial<State> = {
			encryptedSecrets,
			language,
			networkUrl,
			networks,
			currencyConversion,
			activeAccountIndex,
			// above are values in chrome.storage. Below are everything else.
			chromePort,
			postPortMessage: (message: PortMessage) => {
				chromePort.postMessage(message);
			},
			i18n: i18nDict[language],
		};
		if (message.secrets) {
			state.activeAccount = wallet.deriveAddress({
				...message.secrets,
				index: state.activeAccountIndex!,
			});
			state.secrets = message.secrets;
			state.postPortMessage!({ type: 'reopen' });
		}
		root.render(
			// https://stackoverflow.com/a/65167384/13442719
			// <React.StrictMode>
			<App initialState={state} />
			// </React.StrictMode>
		);
	}
};
chromePort.onMessage.addListener(listen);
