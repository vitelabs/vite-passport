import { joinWords, prefixName } from './utils/strings';

type VitePassport = {
	getConnectedAddress: () => Promise<undefined | string>;
	connectWallet: () => Promise<undefined>;
	getNetwork: () => Promise<string>;
	writeAccountBlock: (type: string, params: object) => Promise<undefined>;
	on: (
		event: 'accountChange' | 'networkChange',
		callback: (payload: { activeAddress?: string; activeNetwork: string }) => void
	) => () => void;
};

const injectedObject: Partial<VitePassport> = {};

const relayedMethods = [
	'getConnectedAddress',
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
			method: 'getConnectedAddress' | 'connectWallet' | 'getNetwork';
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

		// OPTIMIZE: update icon chrome.action
		// https://developer.chrome.com/docs/extensions/reference/action/

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

const eventList = ['accountChange', 'networkChange'];
injectedObject.on = (
	eventName: 'accountChange' | 'networkChange',
	callback: (payload: { activeAddress?: string; activeNetwork: string }) => void
) => {
	if (!eventList.includes(eventName)) {
		throw new Error(`eventName must be ${joinWords(eventList)}`);
	}
	const name = prefixName(eventName);
	const fn = (e: any) => callback(e.detail);
	addEventListener(name, fn);
	return () => removeEventListener(name, fn);
};

// @ts-ignore
window.vitePassport = injectedObject;
