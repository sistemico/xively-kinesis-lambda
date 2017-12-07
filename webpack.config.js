const path = require('path');

const webpack = require('webpack');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const { DIST_PATH = 'dist', DIST_NAME = 'lambda' } = process.env;

module.exports = {
  entry: './src/main',

  output: {
    path: path.resolve(DIST_PATH),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },

  target: 'node',

  node: {
    // disables webpack modification of __dirname. (For server-side file access)
    __dirname: false,
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          formatter: 'stylish',
        },
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      },
      {
        test: /\.(sql|xml)$/,
        use: 'raw-loader',
      },
      // Workaround to get MQTT.js lib bundled
      {
        test: /mqtt/,
        exclude: /\.json$/,
        use: ['shebang-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'database': path.resolve('./src/database'),
      'lib': path.resolve('./src/lib'),
      'processors': path.resolve('./src/processors'),
    },
  },

  plugins: [
    new webpack.DefinePlugin({
      'global.GENTLY': false,
    }),

    new FriendlyErrorsPlugin({
      clearConsole: false,
    }),

    new webpack.IgnorePlugin(/\.\/native/, /\/pg\//),

    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),

    new ZipPlugin({
      filename: DIST_NAME,
    }),
  ],
};
