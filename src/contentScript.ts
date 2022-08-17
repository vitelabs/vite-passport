import { BackgroundResponse, VitePassportMethodCall } from './injectedScript';
import { prefixName } from './utils/strings';
import { injectedScriptEventData } from './utils/types';

// console.log('content');

// OPTIMIZE: chrome.scripting.executeScript https://developer.chrome.com/docs/extensions/reference/scripting/#method-executeScript

const scriptTag = document.createElement('script');
scriptTag.src = chrome.runtime.getURL('src/injectedScript.js'); // made available via web_accessible_resources in manifest.json
document.documentElement.appendChild(scriptTag);
scriptTag.remove();

window.addEventListener('vitePassportMethodCalled', ((
	event: CustomEvent<VitePassportMethodCall>
) => {
	// sendMessage to background.ts
	chrome.runtime.sendMessage(
		event.detail,
		// response from background.ts
		(response: Omit<BackgroundResponse, '_messageId'>) => {
			window.postMessage({
				...response,
				_messageId: event.detail._messageId,
			} as BackgroundResponse);
		}
	);
}) as EventListener); // https://github.com/Microsoft/TypeScript/issues/28357#issuecomment-436484705

// popup calls `triggerInjectedScriptEvent` which triggers this which relays the message to the injected script
chrome.runtime.onMessage.addListener(
	// (message: injectedScriptEventData, sender, reply: () => void) => {
	(message: injectedScriptEventData) => {
		// console.log('message:', message);
		dispatchEvent(
			new CustomEvent(prefixName(message.type), {
				detail: message.payload,
			})
		);
	}
);

export {};
