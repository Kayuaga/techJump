import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser  from '@rollup/plugin-terser'
// import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
const packageJson = require('./package.json')

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: ['react', 'react-dom'],
  plugins: [
    typescript({ useTsconfigDeclarationDir: true, jsx: 'preserve' }),
    resolve({ extensions: ['.jsx', '.js', '.tsx'] }),
    commonjs(),
    terser(),
    peerDepsExternal(),
    babel({
      extensions: ['.jsx', '.js', '.tsx', '.ts'],
      presets: ['@babel/preset-react'],
      exclude: 'node_modules/**',
    }),
    // postcss({
    //   extract: false,
    //   modules: true,
    //   use: ['sass'],
    // }),
  ],
}
