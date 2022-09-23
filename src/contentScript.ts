import { ContentResponse, VitePassportMethodCall } from './injectedScript';
import { getHostname, prefixName } from './utils/strings';
import { injectedScriptEventData } from './utils/types';
import { getValue, setValue } from './utils/storage';

console.log('content');

// Can the window object be modified from a Chrome extension? [duplicate]
// https://stackoverflow.com/questions/12395722/can-the-window-object-be-modified-from-a-chrome-extension

const scriptTag = document.createElement('script');
scriptTag.src = chrome.runtime.getURL('src/injectedScript.js'); // made available via web_accessible_resources in manifest.json
scriptTag.setAttribute('async', 'false');
scriptTag.setAttribute('type', 'text/javascript');
scriptTag.onload = () => scriptTag.remove();
document.documentElement.insertBefore(scriptTag, document.documentElement.children[0]);

// @ts-ignore
window.addEventListener('vitePassportMethodCalled', (async (
	event: CustomEvent<VitePassportMethodCall>
) => {
	const hostname = getHostname(window.location.href);
	const { connectedDomains } = await getValue('connectedDomains');
	const { derivedAddresses, activeAccountIndex } = await getValue([
		'derivedAddresses',
		'activeAccountIndex',
	]);
	const activeAddress = derivedAddresses ? derivedAddresses[activeAccountIndex!] : undefined;
	const domainConnected = !activeAddress ? false : !!connectedDomains?.[activeAddress]?.[hostname];

	const reply = (message: Omit<ContentResponse, '_messageId'>) => {
		window.postMessage({
			...message,
			_messageId: event.detail._messageId,
		} as ContentResponse);
	};

	const connectError = () => {
		reply({
			error: 'Vite Passport must connect via `vitePassport.connectWallet()` first',
		});
	};

	switch (event.detail.method) {
		case 'getConnectedAddress':
			if (!domainConnected) return reply({ result: undefined });
			reply({ result: activeAddress });
			break;
		case 'disconnectWallet':
			if (!domainConnected) return connectError();
			delete connectedDomains![activeAddress!][hostname];
			setValue({ connectedDomains });
			reply({ result: undefined });
			break;
		case 'getNetwork':
			if (!domainConnected) return connectError();
			const { networkList, activeNetworkIndex } = await getValue([
				'networkList',
				'activeNetworkIndex',
			]);
			reply({ result: networkList![activeNetworkIndex!] });
			break;
		case 'connectWallet':
			if (domainConnected) {
				return reply({
					error: `Vite Passport is already connected to ${hostname}`,
				});
			}
			chrome.runtime.sendMessage(event.detail);
			break;
		case 'writeAccountBlock':
			if (!domainConnected) return connectError();
			chrome.runtime.sendMessage(event.detail);
			break;
	}
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
