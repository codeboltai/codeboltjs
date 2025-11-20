const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/agent.ts',
  target: 'node',
  mode: 'production',
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'agent-webpack-bundle.js',
    clean: false,
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // Handle workspace packages
      '@codebolt/codeboltjs': path.resolve(__dirname, '../../packages/codeboltjs/dist'),
      '@codebolt/agent': path.resolve(__dirname, '../../packages/agent/dist'),
      '@codebolt/types': path.resolve(__dirname, '../../common/types/dist'),
      '@codebolt/litegraph': path.resolve(__dirname, '../../packages/litegraph/dist'),
      '@codebolt/agent-shared-nodes': path.resolve(__dirname, '../shared-nodes/dist')
    }
  },
  externals: [nodeExternals({
    // Don't bundle Node.js built-in modules
    allowlist: []
  })],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: false
  }
};