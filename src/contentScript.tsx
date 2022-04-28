import injectScript from './injectScript';

console.log('test1234');

injectScript();
// @ts-ignore
window.vitePassport = 'test';

// import React from 'react';
// import ReactDOM from 'react-dom';

// const root = document.createElement('div');
// root.id = 'crx-root';
// document.body.append(root);
// console.log('test');
// ReactDOM.render(
// 	<React.StrictMode>
// 		<h1>test</h1>
// 	</React.StrictMode>,
// 	root
// );

// import injectScript from './injectScript';

// console.log('content script');

// injectScript();

// // console.log(chrome.runtime.getURL);

// const scriptTag = document.createElement('script');
// scriptTag.setAttribute('type', 'text/javascript');
// scriptTag.setAttribute('src', chrome.extension.getURL('inject.ts'));
// document.documentElement.appendChild(scriptTag);

// // function injectScript(content) {
// // 	try {
// // 		const container = document.head || document.documentElement;
// // 		const scriptTag = document.createElement('script');
// // 		scriptTag.setAttribute('async', 'false');
// // 		scriptTag.textContent = content;
// // 		container.insertBefore(scriptTag, container.children[0]);
// // 		container.removeChild(scriptTag);
// // 	} catch (error) {
// // 		console.error('MetaMask: Provider injection failed.', error);
// // 	}
// // }

// export {};
