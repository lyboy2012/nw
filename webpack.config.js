'use strict';

var path = require('path'),
    fs = require('fs'),
    srcDir = path.resolve(process.cwd(), 'src'),
    build = path.resolve(process.cwd(), '__build'),
    assets = path.resolve(process.cwd(), 'assets'),
    webpack = require("webpack"),
    commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
function makeConf(options) {
    var jsDir = path.resolve(srcDir, 'js');
    var config = {
        entry: genEntries(),
        output: {
            path: build,
            publicPath: assets,
            filename: "[name].js"
        },
        resolve: {
            root: [srcDir, './node_modules'],
            extensions: ['', '.js']
        },
        resolveLoader: {
            root: path.join(__dirname, 'node_modules')
        },
        plugins: [
            new webpack.ProvidePlugin({
                jQuery: path.resolve(jsDir, 'lib') + "/jquery-2.1.4",
                $: path.resolve(jsDir, 'lib') + "/jquery-2.1.4",
                // nie: "nie"
            }),
            commonsPlugin
        ]

    };

    return config;
}

function genEntries() {
    var jsDir = path.resolve(srcDir, 'js');
    var names = fs.readdirSync(jsDir);
    var map = {};

    names.forEach(function(name) {
        var m = name.match(/(.+)\.js$/);
        var entry = m ? m[1] : '';
        var entryPath = entry ? path.resolve(jsDir, name) : '';

        if (entry) map[entry] = entryPath;
    });

    return map;
}
module.exports = makeConf();
