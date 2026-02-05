const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    target: 'node',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs2',
    },

    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'codeboltagent.yaml', to: './' },
            ],
        }),
        new webpack.ProvidePlugin({
            process: path.resolve(__dirname, 'process-polyfill.js'),
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
            ...Object.keys(process.env).reduce((env, key) => {
                env[`process.env.${key}`] = JSON.stringify(process.env[key]);
                return env;
            }, {}),
            'process.versions.node': JSON.stringify(process.versions.node),
            'process.versions': JSON.stringify(process.versions),
            'module.parent': JSON.stringify({}),
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /test\/.*\.pdf$/,
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^bufferutil$/,
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^utf-8-validate$/,
        }),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.handlebars'],
        fallback: {
            path: require.resolve('path-browserify'),
            fs: false,
            crypto: false,
            http: false,
            https: false,
            stream: false,
            zlib: false,
            util: false,
            url: false,
            net: false,
            tls: false,
            assert: false,
            dns: false,
            constants: false,
            querystring: false,
            timers: false,
            events: false,
            os: false,
            buffer: false,
            vm: false,
            punycode: false,
            process: path.resolve(__dirname, 'process-polyfill.js'),
            string_decoder: false,
            sys: false,
            domain: false,
            console: false,
            worker_threads: false,
            perf_hooks: false,
            async_hooks: false,
            diagnostics_channel: false,
            sqlite: false,
        },
        alias: {}
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                exclude: /node_modules[\\/\\]pdf-parse/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        compact: false,
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        node: 'current',
                                    },
                                },
                            ],
                        ],
                    },
                },
            },
            {
                test: /\.handlebars$/,
                use: 'handlebars-loader',
            },
            {
                test: /\.node$/,
                loader: 'node-loader',
            },
        ],
    },
    experiments: {
        topLevelAwait: true,
    },
    optimization: {
        minimize: false,
    },
    node: {
        global: true,
        __filename: false,
        __dirname: false,
    },
    externals: [
        function ({ request }, callback) {
            if (request.match(/^node:/)) {
                return callback(null, "commonjs " + request.substr(5));
            }
            if (request.match(/^[a-z][a-z\/\.\-0-9]*$/i) && !request.includes('@codebolt')) {
                const builtinModules = [
                    'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns', 'domain', 'events',
                    'fs', 'http', 'https', 'net', 'os', 'path', 'punycode', 'querystring', 'readline', 'stream',
                    'string_decoder', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib', 'fs/promises'
                ];
                if (builtinModules.includes(request)) {
                    return callback(null, "commonjs " + request);
                }
            }
            callback();
        }
    ],
};
