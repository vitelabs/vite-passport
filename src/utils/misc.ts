import { TextInputRefObject } from '../components/TextInput';

export const isDarkMode = () => document.documentElement.classList.contains('dark');

export const prefersDarkTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const validateInputs = (inputRefs: React.MutableRefObject<TextInputRefObject | undefined>[]) => {
	let allRefsInputsAreValid = true;
	for (const ref of inputRefs) {
		const isValid = ref.current!.isValid;
		if (!isValid) {
			allRefsInputsAreValid = false;
		}
	}
	return allRefsInputsAreValid;
};
