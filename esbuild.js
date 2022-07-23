const stylePlugin = require('esbuild-style-plugin');

const args = process.argv.slice(2);
const PROD = args.includes('--prod');

require('esbuild')
	.build({
		entryPoints: [
			'src/assets/logo-blue-1024.png',
			'src/main.tsx',
			'src/background.ts',
			'src/contentScript.ts',
			'src/confirmation.html',
			'popup.html',
			'manifest.json',
		],
		outdir: 'dist',
		bundle: true,
		platform: 'browser',
		sourcemap: true,
		watch: !PROD,
		minify: PROD,
		treeShaking: PROD,

		format: 'cjs',
		// globalName: '_contentScriptReturn',
		// footer: { js: '_contentScriptReturn.default' }, // this allows the default export to be returned to global scope
		banner: {
			// https://github.com/evanw/esbuild/issues/1006
			// js: `var regeneratorRuntime;`,
			// js: `delete window.eval;`,
		},
		loader: {
			'.html': 'copy',
			'.json': 'copy',
			'.png': 'copy',
		},
		plugins: [
			stylePlugin({
				postcss: {
					plugins: [
						// require('tailwindcss'), require('autoprefixer')

						// https://github.com/g45t345rt/esbuild-style-plugin/issues/3#issuecomment-1044801403
						// require('postcss-import')({
						// 	path: [path.join(__dirname, 'assets/css'), path.join(__dirname, 'assets')],
						// }),
						// require('postcss-url')({ url: 'inline' }),
						require('postcss-nested'),
						require('autoprefixer'),
						require('tailwindcss')(),
					],
				},
			}),
		],
		watch: {
			onRebuild(error, result) {
				const time = Date.now();
				if (error) console.error(`watch build failed ${time}:`, error);
				else console.log(`watch build succeeded ${time}:`, result);
			},
		},
	})
	.catch(() => process.exit(1));
