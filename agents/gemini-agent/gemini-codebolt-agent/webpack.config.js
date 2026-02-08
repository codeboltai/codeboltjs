const path = require('path');

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // processor-pieces/base is not in @codebolt/agent's exports map,
      // so we resolve it directly to the dist file for bundling.
      '@codebolt/agent/processor-pieces/base': path.resolve(
        __dirname,
        'node_modules/@codebolt/agent/dist/processor-pieces/base/index.js'
      ),
    },
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  externals: [
    function({ request }, callback) {
      // Bundle processor-pieces/base (handled by resolve.alias above)
      if (request === '@codebolt/agent/processor-pieces/base') {
        return callback();
      }
      // All other @codebolt packages are external (available at runtime)
      if (/^@codebolt\//.test(request)) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    },
  ],
};
