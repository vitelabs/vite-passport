/* eslint-disable */

import { wallet } from '@vite/vitejs';
import { VitePassportMethodCall } from './injectedScript';
import { decrypt } from './utils/encryption';
import { getValue, setValue } from './utils/storage';
import { MINUTE } from './utils/time';
import { PortMessage, Secrets, State } from './utils/types';

console.log('background');

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

// let password: string | undefined;
let secrets: Secrets | undefined;
let lockTimers: NodeJS.Timeout[] = [];

const getActiveTabId = () => {
	return new Promise((resolve) => {
		chrome.tabs.query({ active: true }, ([tab]) => resolve(tab.id));
	});
};

// https://stackoverflow.com/a/39732154/13442719
chrome.runtime.onConnect.addListener((chromePort) => {
	console.log('onConnect!!!');
	chromePort.postMessage({ secrets, type: 'opening' } as PortMessage);
	chromePort.onMessage.addListener((message: PortMessage) => {
		console.log('message:', message);
		switch (message.type) {
			// case 'updatePassword':
			// 	if (message.password) {
			// 		password = message.password;
			// 	}
			// 	break;
			case 'updateSecrets':
				if (message.secrets) {
					secrets = message.secrets;
				}
				break;
			case 'reopen':
				lockTimers.forEach((lockTimer) => clearTimeout(lockTimer));
				lockTimers = [];
				break;
			case 'lock':
				// password =
				secrets = undefined;
				break;
			default:
				break;
		}
	});
	chromePort.onDisconnect.addListener(async () => {
		console.log('onDisconnect');
		if (secrets) {
			lockTimers.push(
				setTimeout(() => {
					console.log('locked out');
					// password =
					secrets = undefined;
				}, 3000) // for testing
				// }, 5 * MINUTE) // TODO: make this time adjustable
			);
		}
	});
});

chrome.runtime.onMessage.addListener(
	(message: VitePassportMethodCall, sender, reply) => {
		(async () => {
			switch (message.method) {
				case 'getConnectedAccount':
					// TODO: only allow active tab to call this
					// getActiveTabId

					// reply(() => {
					// 	// await requireUnlock();
					// 	return 'vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f';
					// });
					// reply('vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f');

					if (secrets) {
						const { activeAccountIndex } = await getValue([
							'activeAccountIndex',
						]);
						// const addr = wallet.deriveAddress({ ...secrets, index: activeAccountIndex || 0 });
						// console.log('addr:', addr);
						// reply(addr.address);
					} else {
						await requireUnlock();
					}
					break;
				case 'signBlock':
					await requireUnlock();
					// TODO: only allow active tab to call this
					// getActiveTabId
					reply({ sig: 'signed block' });
					break;
				default:
					break;
			}
		})();

		return true;
	}
);

const requireUnlock = async () => {
	if (!secrets) {
		openPopup('/');
	}
	return true;
};

const host = chrome.runtime.getURL('src/confirmation.html');
const openPopup = async (path: string) => {
	const lastFocused = await chrome.windows.getCurrent();
	await chrome.windows.create({
		url: host + path,
		type: 'popup',
		width: 18 * 16, // w-[18rem]
		height: 30 * 16 + 22, // h-[30rem] + frame header height (22px on macOS?)
		top: lastFocused.top,
		left: lastFocused.left! + (lastFocused.width! - 18 * 16),
	});
};
