import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
import path from 'path';

// 自动加载对应的 .env 文件
const envFilePath = path.resolve(process.cwd(), `.env`);
const env = dotenv.config({ path: envFilePath }).parsed || {};
// 将其转为 Rollup 能识别的格式
const envWithProcessPrefix = {};
for (const k in env) {
  envWithProcessPrefix[`process.env.${k}`] = JSON.stringify(env[k]);
}

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
      replace({
        preventAssignment: true,
        ...envWithProcessPrefix,
      }),
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
