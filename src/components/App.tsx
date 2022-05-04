import Router from './Router';
import { Provider } from '../utils/global-context';
import { useEffect, useState } from 'react';
import { PortMessage, State } from '../utils/types';
import en from '../i18n/en';
import { getValue } from '../utils/storage';
import { decrypt } from '../utils/encryption';

export const i18nDict = { en };

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
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
				if (encryptedSecrets && message.password) {
					try {
						state.secrets = JSON.parse(await decrypt(encryptedSecrets, message.password));
						state.postPortMessage!({ type: 'reopen' });
					} catch {}
				}
				initialStateSet(state);
			}
		};
		chromePort.onMessage.addListener(listen);
	}, []);

	return initialState ? (
		<Provider initialState={initialState}>
			<Router />
		</Provider>
	) : null;
};

export default App;
