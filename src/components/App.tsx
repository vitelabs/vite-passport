import '../styles/reset.css';
import '../styles/colors.css';
import '../styles/classes.css';
import Router from './Router';
import { Provider } from '../utils/global-context';
import { useEffect, useState } from 'react';
import { State } from '../utils/types';

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
		const state: Partial<State> = {
			// networkType: localStorage.networkType || 'testnet',
			// language: localStorage.language || 'en',
			language: 'en',
			i18n: {},
			// vcInstance: getValidVCSession() ? initVC() : null,
			balances: {},
			network: 'Mainnet',
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
