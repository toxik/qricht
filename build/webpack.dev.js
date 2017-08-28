process.env.NODE_ENV = 'development'

const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('../webpack.common.js')

module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './docs',
    host: '0.0.0.0',
    disableHostCheck: true
    // hot: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    })
    // new webpack.HotModuleReplacementPlugin()
  ]
})
