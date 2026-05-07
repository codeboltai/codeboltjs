const path = require('path');

// Internal workspace packages — always bundle these
const workspacePackages = [
  '@codebolt/client-sdk',
  '@codebolt/types',
];

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    symlinks: true,
    alias: {
      bufferutil: false,
      'utf-8-validate': false,
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
  externals: [
    function ({ request }, callback) {
      if (!request) return callback();

      // Always bundle relative imports
      if (request.startsWith('.') || request.startsWith('/')) {
        return callback();
      }

      // Always bundle workspace packages
      if (workspacePackages.some(pkg => request === pkg || request.startsWith(pkg + '/'))) {
        return callback();
      }

      // Bundle everything else (commander, axios, ws, socket.io-client — all pure JS)
      return callback();
    },
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
  ignoreWarnings: [
    { message: /Critical dependency/ },
  ],
  devtool: false,
  optimization: {
    minimize: false,
  },
};
