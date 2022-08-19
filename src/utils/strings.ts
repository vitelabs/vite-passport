export const shortenString = (str: string, startCount = 8, endCount = 8) => {
	if (str.length <= startCount + endCount) {
		return str;
	}
	return str.slice(0, startCount) + '...' + str.slice(-endCount);
};
export const shortenAddress = (address: string) => shortenString(address, 8, 5);
export const shortenHash = (hash: string) => shortenString(hash, 5, 5);
export const shortenTti = (hash: string) => shortenString(hash, 7, 5);

// https://www.30secondsofcode.org/js/s/copy-to-clipboard-async?from=autocomplete
export const copyToClipboardAsync = (str = '') => {
	if (navigator && navigator.clipboard && navigator.clipboard.writeText)
		return navigator.clipboard.writeText(str);
	return window.alert('The Clipboard API is not available.');
};

export const toBiggestUnit = (num: string, decimals = 0) => {
	// Assume num is a unsigned integer (i.e. positive with no decimals) and decimals is > 0
	num = `${num.substring(0, num.length - decimals) || 0}.${'0'.repeat(
		Math.max(0, decimals - num.length)
	)}${num.substring(Math.max(0, num.length - decimals))}`;
	return num.replace(/(0+|\.0+|\.)$/, '');
};

export const toSmallestUnit = (num: string, decimals = 0) => {
	// Assume num is a positive number and decimals is > 0
	const indexOfDot = num.indexOf('.');
	if (indexOfDot === -1) {
		return num + '0'.repeat(decimals);
	}
	const decimalPlaces = num.length - indexOfDot - 1;
	return (num.substring(indexOfDot + 1) + '0'.repeat(decimals - decimalPlaces)).replace(/^0+/g, '');
};

export const roundDownTo6Decimals = (balance: string) =>
	Math.floor(+balance * 1000000) / 1000000 + '';

// These don't check for what comes after the protocol
export const validateWsUrl = (v = '') => /^(ws:\/\/|wss:\/\/)/.test(v);
export const validateHttpUrl = (v = '') => /^(http:\/\/|https:\/\/)/.test(v);

// https://howchoo.com/javascript/how-to-turn-an-object-into-query-string-parameters-in-javascript
export const toQueryString = (params: { [key: string]: any }) =>
	'?' +
	Object.keys(params)
		.filter((key) => !!params[key])
		.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
		.join('&');

export const getHostname = (url = '') => {
	if (!url.startsWith('http')) {
		return '';
	}
	return new URL(url).hostname;
};

export const parseQueryString = (urlSearchParams: string): { [key: string]: string } => {
	if (urlSearchParams[0] !== '?') {
		throw new Error('urlSearchParams must start with "?"');
	}
	const split = urlSearchParams.slice(1).split('&');
	return split
		.map((p) => p.split('='))
		.reduce((obj, pair) => {
			const [key, value] = pair.map(decodeURIComponent);
			if (key) {
				return { ...obj, [key]: value };
			}
			return obj;
		}, {});
};

export const addIndexToTokenSymbol = (symbol: string, index: null | number) => {
	if (symbol === 'VITE' || symbol === 'VX' || symbol === 'VCP' || index == null) {
		return symbol;
	}
	return `${symbol}-${('' + index).padStart(3, '0')}`;
};

// https://stackoverflow.com/a/4149393/4975090
// export const reverseCamelCase = (str = '') =>
// 	str.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => {
// 		return str.toUpperCase();
// 	});

export const makeReadable = (err: any) =>
	err.toString() === '[object Object]' ? JSON.stringify(err) : err.toString();

export const joinWords = (arr: string[], conjunction = 'or') => {
	const listStart = arr.slice(0, -1).join(', ');
	const listEnd = arr.slice(-1);
	return [listStart, listEnd].join(
		arr.length <= 1 ? '' : arr.length > 2 ? `, ${conjunction} ` : ` ${conjunction} `
	);
};

// This is to avoid custom event naming collisions
export const prefixName = (str: string) => 'vitePassport' + str[0].toUpperCase() + str.substring(1);

export const normalizeTokenName = (str: string) => str.replace(/ /g, '').toLowerCase();
