import { VitePassportMethodCall } from './injectedScript';
import { getCurrentTab } from './utils/misc';

import { getHostname, toQueryString } from './utils/strings';
import { BgScriptPortMessage } from './utils/types';

// console.log('bg', Date.now());

const lockingAlarmName = 'clearSecrets';
const secretsKey = 'secrets';
const lastPopupIdKey = 'lastPopupId';
chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === lockingAlarmName) {
		chrome.storage.session.remove(secretsKey);
	}
});

// Below are messages from within the extension
chrome.runtime.onConnect.addListener(async (chromePort) => {
	const { secrets } = await chrome.storage.session.get(secretsKey);
	chromePort.postMessage({ secrets, type: 'opening' } as BgScriptPortMessage);
	chromePort.onMessage.addListener((message: BgScriptPortMessage) => {
		if (message.type === 'reopen') {
			chrome.alarms.clear(lockingAlarmName);
		} else if (message.type === 'updateSecrets') {
			chrome.storage.session.set({ secrets: message.secrets });
		} else if (message.type === 'lock') {
			chrome.storage.session.remove(secretsKey);
		}
	});

	// https://stackoverflow.com/a/39732154/13442719
	chromePort.onDisconnect.addListener(async () => {
		// "service workers are terminated when not in use"
		// https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/#alarms
		// https://discourse.mozilla.org/t/alarms-and-settimeout-setinterval-in-background-scripts/36662
		// chrome.alarms.create(lockingAlarmName, { when: Date.now() + 30 * MINUTE });
		chrome.alarms.create(lockingAlarmName, { delayInMinutes: 30 });
		// runAndClearEventListener('vitePassportChromePortDisconnect');
	});
});

// Below are messages from the injected vitePassport object
chrome.runtime.onMessage.addListener(
	(
		message: VitePassportMethodCall,
		sender
		// reply // to contentScript.ts
	) => {
		// console.log('message:', message);
		(async () => {
			if ((await getCurrentTab())?.id !== sender.tab?.id) {
				throw new Error('sender.tab?.id does not match focused tab id');
			}
			if (message.method === 'connectWallet') {
				openPopup('/connect' + toQueryString({ hostname: getHostname(sender.origin) }));
			} else if (message.method === 'writeAccountBlock') {
				openPopup(
					'/sign-tx' +
						toQueryString({
							methodName: message.args[0],
							params: JSON.stringify(message.args[1]),
						})
				);
			} else {
				throw new Error(`"${message.method}" is not a valid vitePassport method`);
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
	try {
		const { lastPopupId } = await chrome.storage.session.get(lastPopupIdKey);
		await chrome.windows.remove(lastPopupId);
	} catch (error) {
		// window with `lastPopupId` doesn't exist
	}
	const tab = await getCurrentTab();
	const { id } = await chrome.windows.create({
		url: host + toQueryString({ routeAfterUnlock, originTabId: tab.id }),
		type: 'popup',
		width: (10 / 16) * 35 * 16, // w-[calc(10/16*35rem)
		height: 35 * 16 + 22, // h-[35rem] + frame header height (22px on macOS?)
		top: lastFocused.top,
		left: lastFocused.left! + (lastFocused.width! - 18 * 16),
	});
	chrome.storage.session.set({ lastPopupId: id || 0 });
};
