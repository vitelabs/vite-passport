import { getValue } from './utils/storage';

console.log('content');

// OPTIMIZE: chrome.scripting.executeScript https://developer.chrome.com/docs/extensions/reference/scripting/#method-executeScript

const scriptTag = document.createElement('script');
scriptTag.src = chrome.runtime.getURL('src/injectedScript.js'); // made available via web_accessible_resources in manifest.json
document.documentElement.appendChild(scriptTag);
scriptTag.remove();

window.addEventListener('vitePassportMethodCalled', ((event: CustomEvent) => {
	chrome.runtime.sendMessage(event.detail as object, (result) => {
		console.log('result:', result);
		window.postMessage({ result, _messageId: event.detail._messageId });
	});
}) as EventListener);

export {};
