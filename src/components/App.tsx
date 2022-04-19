import Router from './Router';
import { Provider } from '../utils/global-context';
import { useEffect, useState } from 'react';
import { State } from '../utils/types';
// import { wallet } from '@vite/vitejs';

import * as test1 from '@sisi/ed25519-blake2b-hd-key';
// console.log('test1', test1);
import * as test3 from 'bip39';
// console.log('test3', test3);
import * as test7 from 'browserify-aes';
// console.log('test7', test7);
import * as test9 from 'create-hmac';
// console.log('test9', test9);
// above breaks

// below doesn't break
// import * as test4 from 'blake2b';
// console.log('test4', test4);
// import * as test5 from 'blakejs';
// console.log('test5', test5);
// import * as test2 from '@sisi/tweetnacl-blake2b';
// console.log('test2', test2);
// import * as test6 from 'bn.js';
// console.log('test6', test6);
// import * as test8 from 'buffer';
// console.log('test8', test8);
// import * as test10 from 'es6-promise';
// console.log('test10', test10);
// import * as test11 from 'jsonrpc-lite';
// console.log('test11', test11);
// import * as test12 from 'net';
// console.log('test12', test12);
// import * as test13 from 'pure-uuid';
// console.log('test13', test13);
// import * as test14 from 'qs';
// console.log('test14', test14);
// import * as test15 from 'scryptsy';
// console.log('test15', test15);
// import * as test16 from 'websocket';
// console.log('test16', test16);
// import * as test17 from 'xhr2';
// console.log('test17:', test17);

const App = () => {
	const [initialState, initialStateSet] = useState<object>();

	useEffect(() => {
		// const thing = wallet.createWallet();
		// console.log('thing:', thing);
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
