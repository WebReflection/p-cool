import {nodeResolve} from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

export default {
  input: './esm/index.js',
  plugins: [
    nodeResolve(),
    terser()
  ],
  output: {
    esModule: false,
    exports: 'named',
    file: './min.js',
    format: 'esm'
  }
};
