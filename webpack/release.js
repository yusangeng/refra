
var path = require('path')
var webpack = require('webpack')
// var UglifyJSPlugin = require('uglifyjs-webpack-plugin')
var UglifyJSPlugin = webpack.optimize.UglifyJsPlugin

var config = {
  entry: path.resolve(__dirname, '../src/index.js'),
  output: {
    library: 'Litchy',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, '../.package'),
    filename: 'litchy.min.js',
    umdNamedDefine: true
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'babel-loader'
        ],
        exclude: /node_modules/
      }
    ]
  },

  plugins: [
    new UglifyJSPlugin({
      mangle: {
        // Skip mangling these
        except: ['$super', '$', 'exports', 'require']
      },
      sourceMap: true
    })
  ]
}

module.exports = config
