import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

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
    nodeResolve({
      preferBuiltins: true
    }),
    json(),
  ],
  external: ['pg', 'sequelize'],
}
