// rollup.config.js.
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      name: 'solarBeam',
      file: 'dist/index.js',
      format: 'cjs'
    },
    {
      name: 'solarBeam',
      file: 'dist/index.min.js',
      format: 'umd',
      plugins: [terser()]
    }
  ],
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code.
    }),
    typescript({
      lib: ['es5', 'es6', 'dom'],
      target: 'es5'
    })
  ]
};
