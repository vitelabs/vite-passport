module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}', '*.html'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				// sans: ['arial', 'sans-serif'],
			},
			colors: {
				skin: {
					highlight: 'var(--highlight-color)',
					lowlight: 'var(--lowlight-color)',
					'back-arrow-icon': 'var(--back-arrow-icon-color)',
					'address-icon': 'var(--address-icon-color)',
					'eye-icon': 'var(--eye-icon-color)',
					'connected-green': 'var(--connected-green-color)',
					error: 'var(--error-color)',
					divider: 'var(--divider-color)',
					'unchecked-checkbox': 'var(--unchecked-checkbox-color)',
				},
			},
			textColor: {
				skin: {
					primary: 'var(--primary-text-color)',
					secondary: 'var(--secondary-text-color)',
					tertiary: 'var(--tertiary-text-color)',
					'input-label': 'var(--text-input-label-color)',
				},
			},
			backgroundColor: {
				skin: {
					base: 'var(--bg-base-color)',
					middleground: 'var(--bg-middleground-color)',
					foreground: 'var(--bg-foreground-color)',
					tertiary: 'var(--tertiary-text-color)',
				},
			},
		},
	},
	plugins: [],
};
