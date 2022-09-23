import { TextInputRefObject } from '../containers/TextInput';
import { getTokenIdSearchApiUrl } from './constants';
import { TokenApiInfo } from './types';

export const isDarkMode = () => document.documentElement.classList.contains('dark');

export const prefersDarkTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const validateInputs = (inputRefs: TextInputRefObject[]) => {
	let allRefsInputsAreValid = true;
	for (const ref of inputRefs) {
		if (!ref.isValid) {
			allRefsInputsAreValid = false;
		}
	}
	return allRefsInputsAreValid;
};

export const formatPrice = (units: string | number, unitPrice = 0, label = '', decimals = 2) => {
	return `${label}${(+units * unitPrice).toFixed(decimals)}`;
};

// https://www.30secondsofcode.org/js/s/debounce
export const debounce = (fn: (...args: any) => any, ms = 0) => {
	let timeoutId: NodeJS.Timeout;
	return function (...args: any[]) {
		clearTimeout(timeoutId);
		// @ts-ignore
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};

// https://stackoverflow.com/a/72350250/4975090
export const debounceAsync = <T>(func, wait): ((...args) => Promise<T>) => {
	let timeoutId: NodeJS.Timeout;
	return (...args) => {
		clearTimeout(timeoutId);
		const promiseForFunc = new Promise((resolve) => {
			timeoutId = setTimeout(resolve, wait);
		});
		return promiseForFunc.then(() => func(...args));
	};
};

const tokenApiInfoCache: { [url: string]: { [tti: string]: TokenApiInfo } } = {};
// getTokenApiInfo to differentiate from the `tokenInfo` returned from `viteApi.getBalanceInfo`
export const getTokenApiInfo = async (
	rpcURL: string,
	tokenIds: string | string[]
): Promise<TokenApiInfo[]> => {
	if (!tokenIds.length) {
		return [];
	}
	if (!Array.isArray(tokenIds)) {
		tokenIds = [tokenIds];
	}
	const url = getTokenIdSearchApiUrl(rpcURL);
	if (!url) {
		return [];
	}
	if (!tokenApiInfoCache[url]) {
		tokenApiInfoCache[url] = {};
	}
	if (tokenIds.every((tti) => !!tokenApiInfoCache[url][tti])) {
		return tokenIds.map((tti) => tokenApiInfoCache[url][tti]);
	}
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			platformSymbol: 'VITE',
			tokenAddresses: tokenIds,
		}),
	});
	const data: { msg: string; code: number; data: TokenApiInfo[] } = await res.json();
	if (data.msg === 'ok' && data.code === 0) {
		data.data.forEach((info) => (tokenApiInfoCache[url][info.tokenAddress] = info));
		return data.data;
	}
	return [];
};

export const getCurrentTab = (): Promise<chrome.tabs.Tab> => {
	return new Promise((res) => {
		chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => res(tab));
	});
};
