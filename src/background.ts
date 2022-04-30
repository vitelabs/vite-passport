import { wallet } from '@vite/vitejs';

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
	const host = chrome.runtime.getURL('src/test.html');
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
