const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PolyfillInjectorPlugin = require('webpack-polyfill-injector')
const OfflinePlugin = require('offline-plugin')

module.exports = {
  entry: {
    main: './app/main.js'
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'buble-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new PolyfillInjectorPlugin({
      polyfills: ['Element.prototype.closest'],
      service: true
    }),
    new HtmlWebpackPlugin({
      template: './app/index.html'
    }),
    new OfflinePlugin({
      externals: ['./bootstrap.4.0.0-beta.css']
    })
  ],
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, './docs')
  }
}
