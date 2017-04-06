module.exports = {
    entry: __dirname + "/app/src/index.js",
    output: {
        path: __dirname + '/app/public/js',
        filename: "bundle.js"
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        }
    }
};
