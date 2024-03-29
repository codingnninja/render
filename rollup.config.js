import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import pkg from './package.json' assert {type:"json"};

export default [
  {
    input:'src/index.js',
    output: [
      { name: 'render', file: pkg.module, format: 'es' },
    ],
    plugins: [
      terser(),
      nodeResolve({
        browser: true
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
];