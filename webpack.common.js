const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const fs = require( 'fs' );
const webpack = require( 'webpack' );
const terser = require( 'terser' );
const pkg = require( './package.json' );

// Build date in local time (toISOString() is UTC, which would stamp an
// afternoon US Central build with tomorrow's date).
const BUILD_DATE = ( () => {

    const d = new Date();

    return [
        d.getFullYear(),
        String( d.getMonth() + 1 ).padStart( 2, '0' ),
        String( d.getDate() ).padStart( 2, '0' )
    ].join( '-' );

} )();

// Bundles VideoJS and its plugins into a single minified video.js.
class ConcatVideoJsPlugin {

    constructor( { dest, src } ) {
        this.dest = dest;
        this.src = src.map( ( file ) => path.resolve( __dirname, file ) );
    }

    apply( compiler ) {
        compiler.hooks.thisCompilation.tap( 'ConcatVideoJsPlugin', ( compilation ) => {
            compilation.hooks.processAssets.tapPromise(
                {
                    name: 'ConcatVideoJsPlugin',
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
                },
                async () => {
                    // Rebuild in watch mode when any source file changes.
                    this.src.forEach( ( file ) => compilation.fileDependencies.add( file ) );

                    const code = this.src.map( ( file ) => fs.readFileSync( file, 'utf8' ) ).join( '\n' );
                    const minified = await terser.minify( code, { keep_fnames: true, keep_classnames: true } );

                    compilation.emitAsset( this.dest, new webpack.sources.RawSource( minified.code ), { minimized: true } );
                }
            );
        } );
    }

}

module.exports = {

    entry: {
        sbplus: [
            path.resolve(__dirname, './sources/scripts/sbplus-dev.js'),
        ],
    },
    output: {
        filename: 'sources/scripts/[name].js',
        path: path.resolve( __dirname, 'dist' ),
        clean: true,
    },
    module: {

        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                        }
                    },
                    'postcss-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                          // Prefer `dart-sass`
                          implementation: require('sass'),
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin( {
            template: 'index.html',
            filename: path.resolve( __dirname, 'dist', 'index.html' ),
            chunks: [ 'sbplus' ],
            templateParameters: {
                version: pkg.version,
            },
        } ),
        new CopyWebpackPlugin( {
            patterns: [
                {
                    from: 'iframe.html',
                },
                {
                    // Apache caching rules for the player folder on the server
                    from: '.htaccess',
                },
                {
                    from: 'default.*',
                },
                {
                    from: 'assets',
                    to: 'assets',
                },
                {
                    from: 'sources/images',
                    to: 'sources/images',
                },
                {
                    from: 'sources/fonts',
                    to: 'sources/fonts',
                },
                {
                    from: 'sources/manifest.json',
                    to: 'sources',
                },
                {
                    from: 'sources/scripts/libs',
                    to: 'sources/scripts/libs',
                    globOptions: {
                        // Built by ConcatVideoJsPlugin instead.
                        ignore: [ "**/videojs/plugins/**", "**/videojs/video.js" ],
                    },
                },
                {
                    from: 'sources/scripts/php',
                    to: 'sources/scripts/php',
                },
                {
                    from: 'sources/scripts/templates',
                    to: 'sources/scripts/templates',
                },
            ],
        } ),
        new ConcatVideoJsPlugin( {
            dest: 'sources/scripts/libs/videojs/video.js',
            src: [
                './sources/scripts/libs/videojs/video.js',
                './sources/scripts/libs/videojs/plugins/cuepoint/videojs.cuepoints.js',
                './sources/scripts/libs/videojs/plugins/markers/videojs-markers.js',
                './sources/scripts/libs/videojs/plugins/resolution/silvermine-videojs-quality-selector.min.js',
                './sources/scripts/libs/videojs/plugins/youtube/youtube.js',
                './sources/scripts/libs/videojs/plugins/vimeo/videojs-vimeo.min.js',
            ],
        } ),
        new MiniCssExtractPlugin({
            filename: 'sources/css/[name].css',
        } ),
        // Stamps the version from package.json onto sbplus.js and sbplus.css,
        // so the version only needs to be changed in package.json.
        new webpack.BannerPlugin( {
            banner: `/*! Storybook Plus ${pkg.version} | built ${BUILD_DATE} | ${pkg.homepage} | ${pkg.license} */`,
            raw: true,
            entryOnly: true,
        } ),
    ],

};