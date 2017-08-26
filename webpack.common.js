const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const OfflinePlugin = require('offline-plugin')

module.exports = {
  entry: {
    polyfills: ['element-closest', 'string.prototype.endswith'],
    main: './app/main.js'
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'buble-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['./docs/*.js']),
    new HtmlWebpackPlugin({
      template: './app/index.html'
    }),
    new OfflinePlugin()
  ],
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, './docs')
  }
}
