import { TextInputRefObject } from '../containers/TextInput';
import { TokenApiInfo } from './types';

export const isDarkMode = () => document.documentElement.classList.contains('dark');

export const prefersDarkTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const validateInputs = (
	// inputRefs: React.MutableRefObject<TextInputRefObject | undefined>[]
	inputRefs: TextInputRefObject[]
) => {
	let allRefsInputsAreValid = true;
	for (const ref of inputRefs) {
		let isValid = ref.isValid;
		// if (typeof isValid === 'object') {
		//   const issue = await isValid;
		//   if (issue) {
		//     allRefsInputsAreValid = false;
		//   }
		// }
		if (!isValid) {
			allRefsInputsAreValid = false;
		}
	}
	return allRefsInputsAreValid;
};

export const calculatePrice = (
	units: string | number,
	price: number,
	label = '$',
	decimals = 2
) => {
	return `${label}${(+units * price).toFixed(decimals)}`;
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

const tokenApiInfoCache: { [tti: string]: TokenApiInfo } = {};
// getTokenApiInfo to differentiate from the `tokenInfo` returned from `viteApi.getBalanceInfo`
export const getTokenApiInfo = async (tokenIds: string | string[]): Promise<TokenApiInfo[]> => {
	if (!tokenIds.length) {
		return [];
	}
	if (Array.isArray(tokenIds) && tokenIds.every((tti) => !!tokenApiInfoCache[tti])) {
		return tokenIds.map((tti) => tokenApiInfoCache[tti]);
	}
	const res = await fetch('https://vitex.vite.net/api/v1/cryptocurrency/info/platform/query', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			platformSymbol: 'VITE',
			tokenAddresses: Array.isArray(tokenIds) ? tokenIds : [tokenIds],
		}),
	});
	const data: { msg: string; code: number; data: TokenApiInfo[] } = await res.json();
	if (data.msg === 'ok' && data.code === 0) {
		data.data.forEach((info) => (tokenApiInfoCache[info.tokenAddress] = info));
		return data.data;
	}
	// TODO: fail gracefully
	return [];
};

export const getCurrentTab = (): Promise<chrome.tabs.Tab> => {
	return new Promise((res) => {
		chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => res(tab));
	});
};
