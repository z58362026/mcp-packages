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
      del({ targets: 'dist/*' }),
      json(),
      resolve({
        preferBuiltins: true,
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      }),
      commonjs({
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      }),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      babel({
        exclude: 'node_modules/**',
        include: 'src/**',
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        babelHelpers: 'bundled',
      }),
      terser({}),
    ],
    external: ['@modelcontextprotocol/sdk', 'zod', 'zod-to-json-schema', 'fs/promises', 'path'],
    onwarn(warning, warn) {
      // 忽略某些警告
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    },
  },
];
