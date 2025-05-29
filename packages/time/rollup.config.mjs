import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        entryFileNames: '[name].esm.js',
        format: 'esm',
        dir: 'dist',
      },
      {
        entryFileNames: '[name].cjs.js',
        dir: 'dist',
        format: 'cjs',
      },
    ],
    plugins: [
      json(),
      typescript({ tsconfig: './tsconfig.json' }), // 指定 tsconfig.json
      del({ targets: 'dist/*' }),
      terser(),
      resolve({
        preferBuiltins: true,
      }),
      commonjs(),

      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env'],
      }),
    ],
  },
];
