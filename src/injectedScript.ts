import { wallet } from '@vite/vitejs';
// import { extensionId } from './background';

Object.defineProperty(window, 'vitePassport', {
	enumerable: true,
	writable: true,
	configurable: true,
	value: {
		signBlock: () => {
			// const port = chrome.runtime.connect(extensionId, { name: 'vitePassport' });
			// port.postMessage({ joke: 'Knock knock' });
			window.dispatchEvent(
				new CustomEvent('signBlock', {
					detail: { aaa: 'test' },
				})
			);
		},
	},
});

// @ts-ignore
// window.vitePassport = {
// 	signBlock: () => {
// 		console.log('extensionId:', extensionId);
// 		// chrome.runtime.sendMessage(extensionId, { aaa: 'test' }, (response) => {
// 		// 	console.log('response:', response);
// 		// 	// resolve(response);
// 		// });

// 		port.postMessage({ joke: 'Knock knock' });

// 		// vitePassport.signBlock().then(res => console.log(res))
// 		// port.postMessage({ joke: 'Knock knock' });
// 		// console.log('port:', port);
// 		// return new Promise((resolve, reject) => {
// 		// 	chrome.runtime.sendMessage(extensionId, { aaa: 'test' }, (response) => {
// 		// 		console.log('response:', response);
// 		// 		resolve(response);
// 		// 	});
// 		// });
// 	},
// };
