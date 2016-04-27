var webpack = require('webpack');

var config = {
  entry: './src/sumo_logic.js',
  output: {
    path: './build',
    filename: 'sumologic.js'
  },
  module: {
      loaders: [
        {
          test: /.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['es2015']
          }
        }
      ]
    }
};

module.exports = config;
