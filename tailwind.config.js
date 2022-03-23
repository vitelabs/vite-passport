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
					// 'pending-green': 'var(--pending-green-color)',
					// 'alert-red': 'var(--alert-red-color)',
					highlight: 'var(--highlight-color)',
					medlight: 'var(--medlight-color)',
					lowlight: 'var(--lowlight-color)',
					'bg-base': 'var(--bg-base-color)',
					alt: 'var(--alt-color)',
				},
			},
			textColor: {
				skin: {
					primary: 'var(--text-primary-color)',
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
					'line-divider': 'var(--bg-line-divider-color)',
				},
			},
			borderColor: {
				skin: {
					foreground: 'var(--bg-foreground-color)',
					// // highlight: 'var(--highlight-color)',
					lowlight: 'var(--lowlight-color)',
				},
			},
		},
	},
	plugins: [],
};
