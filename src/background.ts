import { wallet } from '@vite/vitejs';
import { getValue, setValue } from './utils/storage';
import { MINUTE } from './utils/time';
import { PortMessage } from './utils/types';

console.log('background');

// export const extensionId = 'aojhfjhdaoajbbhnjbjpeicojffnkpai';

// // export const port = chrome.runtime.connect(extensionId);
// const port = chrome.runtime.connect(extensionId, { name: 'vitePassport' });
// console.log('port:', port);

// port.onMessage.addListener((msg) => {
// 	console.log('msg:', msg);
// 	if (msg.question === "Who's there?") port.postMessage({ answer: 'Madame' });
// 	else if (msg.question === 'Madame who?') port.postMessage({ answer: 'Madame... Bovary' });
// });

// https://github.com/Microsoft/TypeScript/issues/28357#issuecomment-436484705
// window.addEventListener('signBlock', ((event: CustomEvent) => {
// 	console.log('event:', event.detail);
// }) as EventListener);

chrome.runtime.onMessage.addListener(async (message, sender, reply) => {
	console.log('message:', message);
	console.log('sender:', sender);
	reply({ sig: 'signed block' });
	// onMessage(message, sender).then(reply);
	// signBlock();
	// const tx = params;
	// const tabId = await getActiveTabId();
	const host = chrome.runtime.getURL('src/confirmation.html');
	console.log('host:', host);
	const search = '';
	const hash = '';
	openPopup(`${host}`).then((res) => {
		console.log('res:', res);
	});

	return true;
});

async function openPopup(url: string) {
	const lastFocused = await chrome.windows.getCurrent();
	await chrome.windows.create({
		url,
		type: 'popup',
		width: 18 * 16, // w-[18rem]
		height: 30 * 16 + 22, // h-[30rem] + frame header height (22px on macOS?)
		top: lastFocused.top,
		left: lastFocused.left! + (lastFocused.width! - 18 * 16),
	});
}

let password = '';
let passwordRemovers: NodeJS.Timeout[] = [];

// https://stackoverflow.com/a/39732154/13442719
chrome.runtime.onConnect.addListener((chromePort) => {
	// console.log('onConnect!!!');
	chromePort.postMessage({ password, type: 'opening' } as PortMessage);
	// setTimeout(() => {
	// 	chromePort.postMessage({ password, type: 'opening' } as PortMessage);
	// }, 1000);
	// chrome.runtime.sendMessage({ password });
	chromePort.onMessage.addListener((message: PortMessage) => {
		console.log('message:', message);
		switch (message.type) {
			case 'updatePassword':
				if (message.password) {
					password = message.password;
				}
				break;
			case 'lock':
				password = '';
				break;
			case 'unlock':
				passwordRemovers.forEach((passwordRemover) => {
					clearTimeout(passwordRemover);
				});
				passwordRemovers = [];
				break;
			default:
				break;
		}
	});
	chromePort.onDisconnect.addListener(() => {
		// console.log('onDisconnect:');
		if (password) {
			passwordRemovers.push(
				setTimeout(() => {
					console.log('password removed');
					password = '';
				}, 3000) // TODO: make this time adjustable
			);
			console.log('passwordRemovers:', passwordRemovers);
		}
	});
});
