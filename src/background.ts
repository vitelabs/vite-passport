import { VitePassportMethodCall, BackgroundResponse } from './injectedScript';
import { getValue } from './utils/storage';
import { getHostname, toQueryString } from './utils/strings';
import { MINUTE } from './utils/time';
import { PortMessage, Secrets } from './utils/types';

// console.log('background');

let secrets: Secrets | undefined;
let lockTimer: NodeJS.Timeout | undefined;

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
				dispatchEvent(
					new CustomEvent('vitePassportConnectDomain', {
						detail: { domain: message.domain },
					})
				);
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
				// }, 3000) // for testing
			}, 5 * MINUTE); // TODO: make this time adjustable
		}
		dispatchEvent(new CustomEvent('vitePassportChromePortDisconnect'));
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
		(async () => {
			if ((await getFocusedTabId()) !== sender.tab?.id) {
				throw new Error('sender.tab?.id does not match focused tab Id');
			}
			if (!sender.origin) {
				throw new Error('sender.origin does not exist');
			}
			const { connectedDomains } = await getValue('connectedDomains');
			const hostname = getHostname(sender.origin);
			if (!connectedDomains?.[hostname]) {
				openPopup('/connect' + toQueryString({ hostname }));
				try {
					await new Promise((resolve, reject) => {
						const connectListener = () => {
							resolve(true);
							removeListeners();
						};
						const disconnectListener = () => {
							reject();
							reply({
								error: 'Vite Passport closed before user approved domain',
							});
							removeListeners();
						};
						const removeListeners = () => {
							removeEventListener('vitePassportConnectDomain', connectListener);
							removeEventListener(
								'vitePassportChromePortDisconnect',
								disconnectListener
							);
						};
						addEventListener('vitePassportConnectDomain', connectListener);
						addEventListener(
							'vitePassportChromePortDisconnect',
							disconnectListener
						);
					});
				} catch (e) {
					return;
				}
			}
			// The above ensures that only the focused tab can send messages to Vite Passport and the user has approved the URL
			// respond back to contentScript.ts
			switch (message.method) {
				case 'signBlock':
					// TODO: only allow active tab to call this
					reply({ result: { sig: 'signed block' } });
					break;
				case 'getConnectedAccount':
					const { accountList, activeAccountIndex } = await getValue([
						'accountList',
						'activeAccountIndex',
					]);
					if (accountList) {
						reply({ result: accountList[activeAccountIndex!] });
					} else {
						reply({ result: 'account not yet created' });
						// I don't think this will ever be called cuz the user needs to create an account to do anything
					}
					break;
				case 'getNetwork':
					const { networkUrl } = await getValue(['networkUrl']);
					reply({ result: networkUrl });
					break;
				default:
					break;
			}
		})();

		return true;
	}
);

const host = chrome.runtime.getURL('src/confirmation.html');
const openPopup = async (route: string) => {
	// route is specified in the params cuz frontend routing doesn't work here (popup window would loost for a file under host+route)
	const lastFocused = await chrome.windows.getCurrent();
	chrome.windows.create({
		url: host + toQueryString({ route }),
		type: 'popup',
		width: (9 / 16) * 35 * 16, // w-[calc(9/16*35rem)
		height: 35 * 16 + 22, // h-[35rem] + frame header height (22px on macOS?)
		top: lastFocused.top,
		left: lastFocused.left! + (lastFocused.width! - 18 * 16),
	});
};

const getFocusedTabId = () => {
	return new Promise((resolve) => {
		chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) =>
			resolve(tab.id)
		);
	});
};
