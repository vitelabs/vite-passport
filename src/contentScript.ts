console.log('content');

const scriptTag = document.createElement('script');
scriptTag.src = chrome.runtime.getURL('src/injectedScript.js'); // made available via web_accessible_resources in manifest.json
document.documentElement.appendChild(scriptTag);
scriptTag.remove();

// https://stackoverflow.com/a/69603416/13442719
if (chrome.runtime?.id) {
	window.addEventListener('signBlock', ((event: CustomEvent) => {
		chrome.runtime.sendMessage(event.detail, (res) => {
			console.log('res:', res);
		});
	}) as EventListener);
}

export {};
