import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser  from '@rollup/plugin-terser'
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
const packageJson = require('./package.json')

export default {
  input: 'app.js',
  output: [
    {
      file: "build/app.js",
      format: 'cjs',
    },
  ],
  plugins: [
    resolve({ extensions: ['.ts', '.js'] }),
    commonjs(),
    json(),
    terser(),
    peerDepsExternal(),
    // babel({
    //   extensions: ['.js', '.ts'],
    //   exclude: 'node_modules/**',
    // }),
  ],
}
