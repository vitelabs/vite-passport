import Router from './Router';
import { Provider } from '../utils/global-context';
import { useEffect, useState } from 'react';
import { State } from '../utils/types';
// import { wallet } from '@vite/vitejs';

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
		// const thing = wallet.createWallet();
		// console.log('thing:', thing);
		const state: Partial<State> = {
			language: 'en',
			i18n: {},
			// vcInstance: getValidVCSession() ? initVC() : null,
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
