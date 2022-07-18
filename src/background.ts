import { VitePassportMethodCall, BackgroundResponse } from './injectedScript';
import { getValue } from './utils/storage';
import { getHostname, toQueryString } from './utils/strings';
import { MINUTE } from './utils/time';
import { PortMessage, Secrets } from './utils/types';

// console.log('background');

let secrets: Secrets | undefined;
let lockTimer: NodeJS.Timeout | undefined;

// Have to make a replacement for `dispatch(Custom Event(...))` and `addEventListener` cuz
// https://stackoverflow.com/questions/41266567/service-worker-warning-in-google-chrome
let eventListeners: { [event: string]: ((data?: any) => void)[] } = {};
const pushEventListener = (event: string, listener: (data?: object) => void) => {
	if (!Array.isArray(eventListeners[event])) {
		eventListeners[event] = [];
	}
	eventListeners[event].push(listener);
};
const runAndClearEventListener = (event: string, data?: object) => {
	(eventListeners[event] || []).forEach((listener) => listener(data));
	delete eventListeners[event];
};
const clearEventListeners = () => {
	eventListeners = {};
};

// Below are messages from within the extension
chrome.runtime.onConnect.addListener((chromePort) => {
	chromePort.postMessage({ secrets, type: 'opening' } as PortMessage);
	chromePort.onMessage.addListener((message: PortMessage) => {
		// console.log('message:', message);
		switch (message.type) {
			case 'reopen':
				if (lockTimer) {
					clearTimeout(lockTimer);
					lockTimer = undefined;
				}
				break;
			case 'updateSecrets':
				secrets = message.secrets;
				break;
			case 'connectDomain':
				// message.domain isn't used for anything rn, but it may come in handy later
				runAndClearEventListener('vitePassportConnectDomain', { domain: message.domain });
				break;
			case 'networkChange':
				console.log('networkChange');
				// message.domain isn't used for anything rn, but it may come in handy later
				runAndClearEventListener('vitePassportNetworkChange', { network: message.network });
				break;
			case 'writeAccountBlock':
				// message.domain isn't used for anything rn, but it may come in handy later
				runAndClearEventListener('vitePassportWriteAccountBlock', { block: message.block });
				break;
			case 'lock':
				secrets = undefined;
				break;
			default:
				break;
		}
	});

	// https://stackoverflow.com/a/39732154/13442719
	chromePort.onDisconnect.addListener(async () => {
		if (secrets) {
			if (lockTimer) {
				clearTimeout(lockTimer);
			}
			lockTimer = setTimeout(() => {
				secrets = undefined;
			}, 30 * MINUTE); // TODO: make this time adjustable
		}
		runAndClearEventListener('vitePassportChromePortDisconnect');
	});
});

// Below are messages from the injected vitePassport object
chrome.runtime.onMessage.addListener(
	(
		message: VitePassportMethodCall,
		sender,
		reply: (res: Omit<BackgroundResponse, '_messageId'>) => void
	) => {
		// console.log('message:', message);
		const replyOnEvent = (event: string, cb: (data?: object) => any) => {
			const connectListener = (data?: object) => {
				reply(cb(data));
				clearEventListeners();
			};
			const disconnectListener = () => {
				reply({ error: 'Vite Passport closed before user approved domain' });
				clearEventListeners();
			};
			pushEventListener(event, connectListener);
			pushEventListener('vitePassportChromePortDisconnect', disconnectListener);
		};
		(async () => {
			if ((await getFocusedTabId()) !== sender.tab?.id) {
				throw new Error('sender.tab?.id does not match focused tab Id');
			}
			if (!sender.origin) {
				throw new Error('sender.origin does not exist');
			}
			// The above ensures that only the focused tab can send messages to Vite Passport
			const hostname = getHostname(sender.origin);
			const { connectedDomains } = await getValue('connectedDomains');
			const domainConnected = !!connectedDomains?.[hostname];

			// Calling `reply` responds back to contentScript.ts
			const connectError = () => {
				reply({
					error: 'Wallet must connect via `vitePassport.connectWallet()` first',
				});
			};

			switch (message.method) {
				case 'getConnectedAccount':
					if (!domainConnected) return connectError();
					const { accountList, activeAccountIndex } = await getValue([
						'accountList',
						'activeAccountIndex',
					]);
					reply({ result: accountList![activeAccountIndex!].address });
					break;
				case 'connectWallet':
					openPopup('/connect' + toQueryString({ hostname }));
					replyOnEvent('vitePassportConnectDomain', () => ({ result: true }));
					break;
				case 'getNetwork':
					if (!domainConnected) return connectError();
					const { networkList, activeNetworkIndex } = await getValue([
						'networkList',
						'activeNetworkIndex',
					]);
					const networkUrl = networkList![activeNetworkIndex!].rpcUrl;
					reply({ result: networkUrl });
					break;
				case 'writeAccountBlock':
					if (!domainConnected) return connectError();
					openPopup(
						'/sign-tx' +
							toQueryString({
								methodName: message.args[0],
								params: JSON.stringify(message.args[1]),
							})
					);
					replyOnEvent('vitePassportWriteAccountBlock', (data: any) => {
						console.log('data:', data);
						return { result: data.block };
					});
					break;
				// case 'on':
				// 	if (!domainConnected) return connectError();
				// 	// message.args
				// 	// console.log('message.args:', message.args);
				// 	break;
				// case 'onAccountChange':
				// 	if (!domainConnected) return connectError();
				// 	//
				// 	break;
				// case 'onNetworkChange':
				// 	if (!domainConnected) return connectError();
				// 	//
				// 	break;
				default:
					break;
			}
		})();

		// https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
		// must return true to indicate asynchronous response otherwise you get this error:
		// "Unchecked runtime.lastError: The message port closed before a response was received."
		return true;
	}
);

const host = chrome.runtime.getURL('src/confirmation.html');
const openPopup = async (routeAfterUnlock: string) => {
	// routeAfterUnlock is specified in the params cuz frontend routing doesn't work here (popup window would look for a file under host+routeAfterUnlock)
	const lastFocused = await chrome.windows.getCurrent();
	// const {id} = await chrome.windows.create({
	// OPTIMIZE: if a previous window is open, focus that instead of opening a new window

	chrome.windows.create({
		url: host + toQueryString({ routeAfterUnlock }),
		type: 'popup',
		width: (9 / 16) * 35 * 16, // w-[calc(9/16*35rem)
		height: 35 * 16 + 22, // h-[35rem] + frame header height (22px on macOS?)
		top: lastFocused.top,
		left: lastFocused.left! + (lastFocused.width! - 18 * 16),
	});
	// console.log('id:', id);
};

const getFocusedTabId = () => {
	return new Promise((resolve) => {
		chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => resolve(tab.id));
	});
};
