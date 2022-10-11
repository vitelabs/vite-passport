import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
import { joinWords, prefixName } from './utils/strings';
import { Network } from './utils/types';

// TODO: sign messages like `vite_signMessage` for ViteConnect
// https://github.com/vitelabs/vite.js/blob/master/src/utils/ed25519.ts#L23

type injectedScriptEvents = 'accountChange' | 'networkChange';
type VitePassport = {
	// These methods are relayed from contentScript.ts => injectedScript.ts
	getConnectedAddress: () => Promise<undefined | string>;
	disconnectWallet: () => Promise<undefined>;
	getNetwork: () => Promise<Network>;

	// These methods are relayed from contentScript.ts => background.ts => popup => contentScript.ts => injectedScript.ts
	connectWallet: () => Promise<{ domain: string }>;
	writeAccountBlock: (type: string, params: object) => Promise<{ block: AccountBlockBlock }>;

	// `on` subscribes to `event` and returns an unsubscribe function
	on: (
		event: injectedScriptEvents,
		callback: (payload: { activeAddress?: string; activeNetwork: Network }) => void
	) => () => void;
};

const injectedObject: Partial<VitePassport> = {};

export type VitePassportMethodCall =
	| {
			readonly _messageId: number;
			method: 'writeAccountBlock';
			args: [string, object];
	  }
	| {
			readonly _messageId: number;
			method: 'getConnectedAddress' | 'connectWallet' | 'disconnectWallet' | 'getNetwork';
	  };

export type ContentResponse = {
	readonly _messageId: number;
	result?: any;
	error?: string;
};

// Calling these methods are relayed like this:
// injectedScript.ts => contentScript.ts => background.ts => contentScript.ts => injectedScript.ts
['getConnectedAddress', 'disconnectWallet', 'getNetwork'].forEach((method) => {
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
			const listener = ({ data }: MessageEvent<ContentResponse>) => {
				if (_messageId === data._messageId) {
					if (data.error) {
						reject(data.error);
					} else {
						resolve(data.result);
					}
					window.removeEventListener('message', listener);
				}
			};
			window.addEventListener(
				// https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/message_event
				// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
				// Triggered by window.postMessage in contentScript.ts
				'message',
				listener
			);
		});
	};
});

// methods that require confirmation popup
['connectWallet', 'writeAccountBlock'].forEach((method) => {
	injectedObject[method] = (...args: any) => {
		window.dispatchEvent(
			new CustomEvent('vitePassportMethodCalled', {
				detail: {
					// _messageId,
					method,
					args,
				} as VitePassportMethodCall,
			})
		);

		return new Promise((resolve, reject) => {
			const resolveEventName = prefixName(method);
			const rejectEventName = prefixName('disconnect');
			const resolveCallback = ((event: CustomEvent) => {
				window.removeEventListener(rejectEventName, rejectCallback);
				resolve(event.detail);
			}) as EventListener;
			const rejectCallback = () => {
				window.removeEventListener(resolveEventName, resolveCallback);
				reject('Vite Passport closed before an action could be confirmed');
			};
			window.addEventListener(resolveEventName, resolveCallback, { once: true });
			window.addEventListener(rejectEventName, rejectCallback, { once: true });
		});
	};
});

const eventList: injectedScriptEvents[] = ['accountChange', 'networkChange'];
injectedObject.on = (
	eventName: injectedScriptEvents,
	callback: (payload: { activeAddress?: string; activeNetwork: Network }) => void
) => {
	if (!eventList.includes(eventName)) {
		throw new Error(`eventName must be ${joinWords(eventList)}`);
	}
	const name = prefixName(eventName);
	const fn = (e: any) => callback(e.detail);
	window.addEventListener(name, fn);
	return () => removeEventListener(name, fn);
};

// @ts-ignore
window.vitePassport = injectedObject;
