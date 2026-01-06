import terser from '@rollup/plugin-terser';

export default [
  // UMD 版本（浏览器用）
  {
    input: 'src/index.js',
    output: {
      file: 'dist/native-bridge.js',
      format: 'umd',
      name: 'NativeBridge',
      exports: 'default'
    }
  },
  
  // UMD 压缩版
  {
    input: 'src/index.js',
    output: {
      file: 'dist/native-bridge.min.js',
      format: 'umd',
      name: 'NativeBridge',
      exports: 'default'
    },
    plugins: [terser()]
  },
  
  // ES Module 版本
  {
    input: 'src/index.js',
    output: {
      file: 'dist/native-bridge.esm.js',
      format: 'es'
    }
  },
  
  // CommonJS 版本
  {
    input: 'src/index.js',
    output: {
      file: 'dist/native-bridge.cjs.js',
      format: 'cjs',
      exports: 'auto'
    }
  }
];