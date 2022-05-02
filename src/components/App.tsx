import Router from './Router';
import { Provider } from '../utils/global-context';
import { useEffect, useState } from 'react';
import { PortMessage, State } from '../utils/types';
import en from '../i18n/en';

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
		const chromePort = chrome.runtime.connect();
		const state: Partial<State> = {
			chromePort,
			postPortMessage: (message: PortMessage) => {
				console.log('message:', message);
				chromePort.postMessage(message);
			},
			language: 'en',
			i18n: en,
			balances: {},
			networkType: 'Mainnet',
			currencyConversion: 'USD',
			transactionHistory: {},
		};
		initialStateSet(state);
	}, []);

	return initialState ? (
		<Provider initialState={initialState}>
			<Router />
		</Provider>
	) : null;
};

export default App;
