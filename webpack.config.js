var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

// module.exports = {
//     context: path.join(__dirname, 'your-app'),
    
// };

module.exports = {
    entry: "./src/client/client.ts",
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, "dist", "public")
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    mode: "development",

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'static' }
        ])
    ]
};
