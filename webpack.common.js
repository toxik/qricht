const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PolyfillInjectorPlugin = require('webpack-polyfill-injector')
const OfflinePlugin = require('offline-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlCriticalPlugin = require('html-critical-webpack-plugin')

const plugins = []
if (process.env.NODE_ENV !== 'development') {
  plugins.push(new CleanWebpackPlugin(['docs/*.js', 'docs/*.css']))
}
plugins.push(
  new PolyfillInjectorPlugin({
    polyfills: ['Element.prototype.closest'],
    service: true
  }),
  new HtmlWebpackPlugin({
    template: './app/index.html'
  }),
  new OfflinePlugin(),
  new ExtractTextPlugin('style.css')
)
if (process.env.NODE_ENV !== 'development') {
  plugins.push(new HtmlCriticalPlugin({
    base: path.join(path.resolve(__dirname), 'docs/'),
    src: 'index.html',
    dest: 'index.html',
    inline: true,
    minify: true,
    extract: true,
    width: 375,
    height: 565,
    penthouse: {
      blockJSRequests: false
    }
  }))
}

module.exports = {
  entry: {
    main: './app/main.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: 'buble-loader'
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    },
    {
      test: /\.(scss)$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
            loader: 'css-loader' // translates CSS into CommonJS modules
          }, {
            loader: 'postcss-loader', // Run post css actions
            options: {
              plugins: function () { // post css plugins, can be exported to postcss.config.js
                return [
                  require('precss'),
                  require('autoprefixer')
                ]
              }
            }
          }, {
            loader: 'sass-loader' // compiles SASS to CSS
          }]
      })
    }
    ]
  },
  plugins,
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, './docs')
  }
}
