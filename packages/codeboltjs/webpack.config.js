const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: './src/index.ts',
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
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'codebolt-standalone.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  externals: {
    // Only exclude Node.js built-ins - everything else gets bundled
    'fs': 'commonjs fs',
    'path': 'commonjs path', 
    'os': 'commonjs os',
    'crypto': 'commonjs crypto',
    'http': 'commonjs http',
    'https': 'commonjs https',
    'net': 'commonjs net',
    'tls': 'commonjs tls',
    'zlib': 'commonjs zlib',
    'stream': 'commonjs stream',
    'events': 'commonjs events',
    'url': 'commonjs url',
    'buffer': 'commonjs buffer',
    'util': 'commonjs util',
    'child_process': 'commonjs child_process',
  },
  optimization: {
    minimize: true,
    // Disable code splitting entirely
    splitChunks: false,
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
