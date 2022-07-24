// import sucrase from '@rollup/plugin-sucrase';
// import resolve from '@rollup/plugin-node-resolve';
// import css from 'rollup-plugin-css-only';

// export default {
// 	input: 'src/main.tsx',
// 	output: [
// 		{
// 			file: 'dist/main.js',
// 			format: 'cjs',
// 			inlineDynamicImports: true,
// 		},
// 	],
// 	plugins: [
// 		resolve({
// 			extensions: ['.js', '.ts', '.jsx', '.tsx'],
// 		}),
// 		sucrase({
// 			exclude: ['node_modules/**'],
// 			transforms: ['typescript'],
// 		}),
// 		css({ output: 'bundle.css' }),
// 	],
// };

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';

export default {
	input: 'src/index.ts',
	output: [
		{
			file: 'dist/index.js',
			name: 'app',
			sourcemap: 'inline',
			format: 'iife',
		},
	],
	plugins: [
		peerDepsExternal(),
		resolve({
			browser: true,
			dedupe: ['react', 'react-dom'],
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
			preventAssignment: true,
		}),
		commonjs(),
		typescript({
			tsconfig: 'tsconfig.json',
			sourceMap: true,
			inlineSources: true,
		}),
		css({ output: 'dist/style.css' }),
	],
};
