const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

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
    new HtmlWebpackPlugin({
      template: './app/index.html'
    }),
    new CleanWebpackPlugin(['./docs/*.js'])
  ],
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, './docs')
  }
}
