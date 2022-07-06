import { AccountBlockType } from '@vite/vitejs/distSrc/accountBlock/type';
import { AddressObj } from '@vite/vitejs/distSrc/utils/type';

const injectedObject: {
	getConnectedAccount?: () => Promise<AddressObj | null>;
	connectWallet?: () => Promise<boolean>;
	getNetwork?: () => Promise<string>;
	signBlock?: () => Promise<AccountBlockType>;
} = {};

const methods = [
	'signBlock',
	'getConnectedAccount',
	'getNetwork',
	'isConnected',
	// 'getAccountBalance',
	// 'methodName',
] as const;

export type VitePassportMethodCall = {
	readonly _messageId: number;
	method: typeof methods[number];
	args: number;
};

export type BackgroundResponse = {
	readonly _messageId: number;
	result?: any;
	error?: string;
};

// Calling these methods are relayed like this:
// injectedScript.ts => contentScript.ts => background.ts => contentScript.ts => injectedScript.ts
methods.forEach((method) => {
	// @ts-ignore
	injectedObject[method] = (...args: any) => {
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
			addEventListener(
				'message',
				({ data }: MessageEvent<BackgroundResponse>) => {
					if (_messageId === data._messageId) {
						if (data.error) {
							reject(data.error);
						} else {
							resolve(data.result);
						}
					}
				},
				{ once: true }
			);
		});
	};
});

// @ts-ignore
window.vitePassport = injectedObject;
