const { merge } = require( 'webpack-merge' );
const path = require( 'path' );
const common = require( './webpack.common.js' );

module.exports = merge( common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: path.resolve( __dirname, 'dist' ),
        hot: true,
        liveReload: true,
        watchFiles: [ './assets/sbplus.xml', './sources/manifest.json', './sources/scripts/libs/videojs/*', './sources/scripts/templates/*' ]
    }
} );