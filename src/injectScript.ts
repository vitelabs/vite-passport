const injectScript = () => {
	Object.defineProperty(window, 'vite', {
		enumerable: true,
		writable: true,
		configurable: true,
		value: { test: () => console.log('test') },
	});
};

export default injectScript;
