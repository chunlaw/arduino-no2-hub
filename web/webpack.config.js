var process = require('process');
const NODE_ENV = process.env.NODE_ENV || 'production';

module.exports = {
    entry: __dirname + '/app/js/index.js',
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
