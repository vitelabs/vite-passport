module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}', '*.html'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['PingFangSC', 'arial', 'sans-serif'],
			},
			colors: {
				skin: {
					'pending-green': 'var(--pending-green-color)',
					highlight: 'var(--highlight-color)',
					lowlight: 'var(--lowlight-color)',
				},
			},
			textColor: {
				skin: {
					base: 'var(--text-base-color)',
					secondary: 'var(--text-secondary-color)',
					muted: 'var(--text-muted-color)',
					// highlight: 'var(--highlight-color)',
				},
			},
			backgroundColor: {
				skin: {
					base: 'var(--bg-base-color)',
					middleground: 'var(--bg-middleground-color)',
					foreground: 'var(--bg-foreground-color)',
					// // highlight: 'var(--highlight-color)',
					input: 'var(--bg-input-color)',
					'line-divider': 'var(--bg-line-divider-color)',
					'reminder-red': 'var(--reminder-red-color)',
				},
			},
			borderColor: {
				skin: {
					muted: 'var(--border-muted-color)',
					// // highlight: 'var(--highlight-color)',
					lowlight: 'var(--lowlight-color)',
				},
			},
		},
	},
	plugins: [],
};
