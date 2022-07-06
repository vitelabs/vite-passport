import { TextInputRefObject } from '../components/TextInput';

export const isDarkMode = () =>
	document.documentElement.classList.contains('dark');

export const prefersDarkTheme = () =>
	window.matchMedia('(prefers-color-scheme: dark)').matches;

export const validateInputs = (
	inputRefs: React.MutableRefObject<TextInputRefObject | undefined>[]
) => {
	let allRefsInputsAreValid = true;
	for (const ref of inputRefs) {
		const isValid = ref.current!.isValid;
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
