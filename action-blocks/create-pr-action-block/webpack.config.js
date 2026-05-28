const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    clean: false,
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      buffer: require.resolve('buffer/'),
      process: path.resolve(__dirname, 'process-polyfill.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'actionblock.yml', to: 'actionblock.yml' },
      ],
    }),
    new webpack.ProvidePlugin({
      process: path.resolve(__dirname, 'process-polyfill.js'),
      Buffer: ['buffer', 'Buffer'],
    }),
    new NodePolyfillPlugin({
      excludeAliases: ['console'],
    }),
    new webpack.IgnorePlugin({ resourceRegExp: /^bufferutil$/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /^utf-8-validate$/ }),
  ],
  externalsPresets: { node: true },
  externals: [
    function ({ request }, callback) {
      if (request && request.startsWith('node:')) {
        return callback(null, `commonjs ${request.slice(5)}`);
      }
      return callback();
    },
  ],
  optimization: {
    minimize: false,
  },
};
