import { BackgroundResponse, VitePassportMethodCall } from './injectedScript';
import { prefixName } from './utils/strings';
import { PortEvent } from './utils/types';

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

// addEventListener('message', (e) => {
// 	console.log('e:', e);
// });

// const chromePort = chrome.runtime.connect();
// chrome.runtime.onConnect.addListener((chromePort) => {
// 	console.log('chromePort:', chromePort);
// });
// console.log('chromePort:', chromePort);

chrome.runtime.onMessage.addListener(
	// (message: PortEvent, sender, reply: () => void) => {
	(message: PortEvent) => {
		dispatchEvent(
			new CustomEvent(prefixName(message.type), {
				detail: message.payload,
			})
		);
	}
);

export {};
