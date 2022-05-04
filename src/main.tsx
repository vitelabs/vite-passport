// import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/reset.css';
import './styles/colors.css';
import './styles/classes.css';
import './styles/theme.ts';

import { PortMessage, State } from './utils/types';
import en from './i18n/en';
import { getValue } from './utils/storage';

const container = document.getElementById('root');
const root = createRoot(container!);

export const i18nDict = { en };

export const now = Date.now();

const chromePort = chrome.runtime.connect();
const listen = async (message: PortMessage) => {
	if (message.type === 'opening') {
		chromePort.onMessage.removeListener(listen);
		const {
			encryptedSecrets,
			// storage defaults
			language = 'en',
			networkType = 'mainnet',
			currencyConversion = 'USD',
			activeAccountIndex = 0,
		} = await getValue(null);
		const state: Partial<State> = {
			encryptedSecrets,
			language,
			networkType,
			currencyConversion,
			activeAccountIndex,
			// above are values in chrome.storage. Below are everything else.
			chromePort,
			postPortMessage: (message: PortMessage) => {
				chromePort.postMessage(message);
			},
			i18n: i18nDict[language],
			transactionHistory: {},
		};
		if (message.secrets) {
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
