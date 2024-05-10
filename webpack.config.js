const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './rsc.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'rsc.min.js'
    },
    externals: {
        'adm-zip': 'adm-zip',
        'fs': 'fs',
        'path': 'path'
    },
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {
                mangle: true, // 开启代码混淆
                compress: true, // 开启代码压缩
                output: {
                    comments: false // 移除所有注释
                }
            }
        })
    ]
};
