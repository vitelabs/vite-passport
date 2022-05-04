// import { AccountBlockType } from '@vite/vitejs/distSrc/accountBlock/type';

const vitePassport = {};

const methods = [
	'getConnectedAccount',
	// 'getAccountBalance',
	'signBlock',
	// 'methodName',
] as const;

export type VitePassportMethodCall = {
	readonly _messageId: number;
	method: typeof methods[number];
	args: number;
};

// Calling these methods are relayed like this:
// injectedScript.ts => contentScript.ts => background.ts => contentScript.ts => injectedScript.ts
methods.forEach((method) => {
	// @ts-ignore
	vitePassport[method] = (...args: any) => {
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
		// "Web context scripts can use custom events to communicate with content scripts (with randomly generated event names, if needed, to prevent snooping from the guest page)."
		const _messageId = Math.random();
		// _messageId is used to differentiate different function calls
		window.dispatchEvent(
			new CustomEvent('vitePassportMethodCalled', {
				detail: {
					_messageId,
					method,
					args,
				} as VitePassportMethodCall,
			})
		);

		return new Promise((resolve, reject) => {
			console.log('reject:', reject);
			const listener = ({ data }: MessageEvent<any>) => {
				console.log('data:', data);
				if (_messageId === data._messageId) {
					console.log('data.result:', data.result);
					resolve(data.result);
					removeEventListener('message', listener);
				}
			};
			addEventListener('message', listener);
		});
	};
});

// @ts-ignore
window.vitePassport = vitePassport;
