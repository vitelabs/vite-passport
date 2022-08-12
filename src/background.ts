import { BackgroundResponse, VitePassportMethodCall } from './injectedScript';
import { getCurrentTab } from './utils/misc';
import { getValue, setValue } from './utils/storage';
import { getHostname, toQueryString } from './utils/strings';
import { BgScriptPortMessage } from './utils/types';

// console.log('bg', Date.now());

const lockingAlarmName = 'clearSecrets';
const secretsKey = 'secrets';
chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === lockingAlarmName) {
		chrome.storage.local.remove(secretsKey);
	}
});

// Have to make a replacement for `dispatch(Custom Event(...))` and `addEventListener` cuz
// https://stackoverflow.com/questions/41266567/service-worker-warning-in-google-chrome
let eventListeners: { [event: string]: ((data?: any) => void)[] } = {};
const pushEventListener = (event: string, listener: (data: BackgroundResponse) => void) => {
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
chrome.runtime.onConnect.addListener(async (chromePort) => {
	const { secrets } = await chrome.storage.local.get(secretsKey);
	chromePort.postMessage({ secrets, type: 'opening' } as BgScriptPortMessage);
	chromePort.onMessage.addListener((message: BgScriptPortMessage) => {
		switch (message.type) {
			case 'reopen':
				chrome.alarms.clear(lockingAlarmName);
				break;
			case 'updateSecrets':
				chrome.storage.local.set({ secrets: message.secrets });
				break;
			case 'connectDomain':
				// message.domain isn't used for anything rn, but it may come in handy later
				runAndClearEventListener('vitePassportConnectDomain', { domain: message.domain });
				break;
			case 'writeAccountBlock':
				// message.domain isn't used for anything rn, but it may come in handy later
				runAndClearEventListener('vitePassportWriteAccountBlock', { block: message.block });
				break;
			case 'lock':
				chrome.storage.local.remove(secretsKey);
				break;
			default:
				break;
		}
	});

	// https://stackoverflow.com/a/39732154/13442719
	chromePort.onDisconnect.addListener(async () => {
		// "service workers are terminated when not in use"
		// https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/#alarms
		// https://discourse.mozilla.org/t/alarms-and-settimeout-setinterval-in-background-scripts/36662
		// chrome.alarms.create(lockingAlarmName, { when: Date.now() + 30 * MINUTE });
		chrome.alarms.create(lockingAlarmName, { delayInMinutes: 30 });
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
		const replyOnEvent = (event: string) => {
			const connectListener = (data: BackgroundResponse) => {
				reply(data);
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
			if ((await getCurrentTab()).id !== sender.tab?.id) {
				throw new Error('sender.tab?.id does not match focused tab id');
			}

			const hostname = getHostname(sender.origin);
			const { connectedDomains } = await getValue('connectedDomains');
			const { accountList, activeAccountIndex } = await getValue([
				'accountList',
				'activeAccountIndex',
			]);
			const activeAccount = accountList![activeAccountIndex!];
			const domainConnected = !!connectedDomains?.[activeAccount.address]?.[hostname];

			// Calling `reply` responds back to contentScript.ts
			const connectError = () => {
				reply({
					error: 'Wallet must connect via `vitePassport.connectWallet()` first',
				});
			};

			switch (message.method) {
				case 'getConnectedAddress':
					if (!domainConnected) return reply({ result: undefined });
					reply({ result: activeAccount.address });
					break;
				case 'connectWallet':
					openPopup('/connect' + toQueryString({ hostname }));
					replyOnEvent('vitePassportConnectDomain');
					break;
				case 'disconnectWallet':
					// OPTIMIZE: if popup is open and "connected", it should switch to disconnect
					// Unlikely for it to be open since `disconnectWallet` is probably called from the dapp frontend (i.e. popup is closed)
					if (!domainConnected) {
						return reply({
							error: `The active Vite Passport account is not connected to ${hostname}`,
						});
					}
					delete connectedDomains[activeAccount.address][hostname];
					setValue({ connectedDomains });
					reply({ result: undefined });
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
					replyOnEvent('vitePassportWriteAccountBlock');
					openPopup(
						'/sign-tx' +
							toQueryString({
								methodName: message.args[0],
								params: JSON.stringify(message.args[1]),
							})
					);
					break;
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

	// TODO: chrome.windows.update window if it exists

	chrome.windows.create({
		url: host + toQueryString({ routeAfterUnlock }),
		type: 'popup',
		width: (10 / 16) * 35 * 16, // w-[calc(10/16*35rem)
		height: 35 * 16 + 22, // h-[35rem] + frame header height (22px on macOS?)
		top: lastFocused.top,
		left: lastFocused.left! + (lastFocused.width! - 18 * 16),
	});
	// console.log('id:', id);
};
