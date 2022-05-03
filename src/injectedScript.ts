import { AccountBlockType } from '@vite/vitejs/distSrc/accountBlock/type';

const vitePassport = {};
const methods = ['getConnectedAccount', 'signBlock'];
// calling these methods are relayed like this:
// injectedScript.ts => contentScript.ts => background.ts => contentScript.ts => injectedScript.ts
// messageId is used to differentiate different function calls

methods.forEach((method) => {
	// @ts-ignore
	vitePassport[method] = (...args: any) => {
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
		// "Web context scripts can use custom events to communicate with content scripts (with randomly generated event names, if needed, to prevent snooping from the guest page)."
		const messageId = Math.random();
		window.dispatchEvent(
			new CustomEvent('vitePassportMethodCalled', {
				detail: {
					messageId,
					method,
					args,
				},
			})
		);

		return new Promise((resolve, reject) => {
			const listener = ({ data }: MessageEvent<any>) => {
				if (messageId === data.messageId) {
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
