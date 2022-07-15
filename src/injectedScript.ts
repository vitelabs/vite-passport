const injectedObject: {
	getConnectedAccount?: () => Promise<null | string>;
	connectWallet?: () => Promise<undefined>;
	getNetwork?: () => Promise<string>;
	writeAccountBlock?: (type: string, params: object) => Promise<undefined>;
	// on?: (event: 'accountChange' | 'networkChange', callback: (data: string) => void) => void;
	addListener?: (
		event: 'accountChange' | 'networkChange',
		callback: (e: Event) => void
		// callback: (data: string) => void
	) => void;
	removeListener?: (
		event: 'accountChange' | 'networkChange',
		callback: (e: Event) => void
		// callback: (data: string) => void
	) => void;
} = {};

const relayedMethods = [
	'getConnectedAccount',
	'connectWallet',
	'getNetwork',
	'writeAccountBlock',
] as const;

export type VitePassportMethodCall =
	| {
			readonly _messageId: number;
			method: 'writeAccountBlock';
			args: [string, object];
	  }
	| {
			readonly _messageId: number;
			method: 'getConnectedAccount' | 'connectWallet' | 'getNetwork';
			// args: any[];
	  };

export type BackgroundResponse = {
	readonly _messageId: number;
	result?: any;
	error?: string;
};

// Calling these methods are relayed like this:
// injectedScript.ts => contentScript.ts => background.ts => contentScript.ts => injectedScript.ts
relayedMethods.forEach((method) => {
	// @ts-ignore
	injectedObject[method] = (...args: any) => {
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
		// "Web context scripts can use custom events to communicate with content scripts (with randomly generated event names, if needed, to prevent snooping from the guest page)."
		// _messageId is used to differentiate different function calls
		const _messageId = Math.random();

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
				// https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/message_event
				// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
				// Triggered by postMessage in contentScript.ts
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

window.addEventListener('vitePassportAccountChange', (e) => {
	console.log('e:', e);
	//
});

// const prefixName = (str: string) => 'vitePassport' + str[0].toUpperCase() + str.substring(1);

// injectedObject.addListener = (eventName: string, callback: (e: Event) => void) => {
// 	if (eventName !== 'accountChange' && eventName !== 'networkChange') {
// 		throw new Error('eventName must be accountChange or networkChange');
// 	}
// 	window.addEventListener(prefixName(eventName), callback);
// 	// window.addEventListener(prefixName(eventName), (e) => {
// 	// 	console.log('e:', e);
// 	// 	// callback(e.detail.result);
// 	// });
// };

// injectedObject.removeListener = (eventName: string, callback: (e: Event) => void) => {
// 	if (eventName !== 'accountChange' && eventName !== 'networkChange') {
// 		throw new Error('eventName must be accountChange or networkChange');
// 	}
// 	window.removeEventListener(prefixName(eventName), callback);
// 	// window.removeEventListener(prefixName(eventName), (e) => {
// 	// 	// callback(e.detail.result);
// 	// });
// };

// @ts-ignore
window.vitePassport = injectedObject;
