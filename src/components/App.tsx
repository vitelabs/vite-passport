import Router from './Router';
import { Provider } from '../utils/global-context';
import { useEffect, useState } from 'react';
import { State } from '../utils/types';
import en from '../i18n/en';

const chromePort = chrome.runtime.connect();

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
		const state: Partial<State> = {
			chromePort,
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
