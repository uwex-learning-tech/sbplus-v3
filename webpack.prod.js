const { merge } = require( 'webpack-merge' );
const common = require( './webpack.common.js' );
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge( common, {

    mode: 'production',
    optimization: {
        minimizer: [
          new TerserPlugin( 
            {
              extractComments: false,
              terserOptions: {
                keep_classnames: true,
                keep_fnames: true
              },
            }
          ),
          new CssMinimizerPlugin(),
        ],
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    
} );