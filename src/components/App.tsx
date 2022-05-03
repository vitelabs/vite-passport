import Router from './Router';
import { Provider } from '../utils/global-context';
import { useEffect, useState } from 'react';
import { PortMessage, State } from '../utils/types';
import en from '../i18n/en';
import { getValue } from '../utils/storage';

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
		const chromePort = chrome.runtime.connect();

		getValue(null).then(
			({
				// storage defaults
				language = 'en',
				networkType = 'Mainnet',
				currencyConversion = 'USD',
				activeAccountIndex = 0,
				encryptedSecrets,
			}) => {
				const state: Partial<State> = {
					language,
					networkType,
					currencyConversion,
					activeAccountIndex,
					encryptedSecrets,
					// above are values in chrome.storage. Below are everything else.
					chromePort,
					postPortMessage: (message: PortMessage) => {
						chromePort.postMessage(message);
					},
					i18n: en,
					balances: {},
					transactionHistory: {},
				};
				initialStateSet(state);
			}
		);
	}, []);

	return initialState ? (
		<Provider initialState={initialState}>
			<Router />
		</Provider>
	) : null;
};

export default App;
