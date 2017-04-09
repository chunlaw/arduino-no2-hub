var process = require('process');
const NODE_ENV = process.env.NODE_ENV || 'production';

module.exports = {
    entry: __dirname + '/app/js/index.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ['env']
                }
            }
        ]
    },
    output: {
        path: __dirname + '/app/public/js',
        filename: NODE_ENV === 'production' ? 'bundle.min.js' : 'bundle.js'
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        }
    }
};
