const path = require('path')

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    main: './index.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.js',
    publicPath: '/',
    libraryExport: 'default',
    libraryTarget: 'commonjs2',
  },
}
