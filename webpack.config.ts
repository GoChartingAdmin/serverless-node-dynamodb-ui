import path = require('path');

import HtmlWebpackPlugin = require('html-webpack-plugin');
import InlineChunkManifestHtmlWebpackPlugin = require('inline-chunk-manifest-html-webpack-plugin');
import webpack = require('webpack');

const SERVER_PORT = process.env.SERVER_PORT || 3001;
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';

const config: webpack.Configuration = {
  devtool: 'cheap-module-source-map',
  entry: [
    'webpack/hot/dev-server',
    `webpack-dev-server/client?http://${SERVER_HOSTNAME}:${SERVER_PORT}`,
    path.join(__dirname, 'src', 'index.tsx'),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'assets/[name].js',
    chunkFilename: 'assets/[name].js',
    publicPath: '/',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        AUTH0_CLIENT_ID: JSON.stringify(process.env.AUTH0_CLIENT_ID),
        AUTH0_DOMAIN: JSON.stringify(process.env.AUTH0_DOMAIN),
        API_BASE_URI: JSON.stringify(process.env.API_BASE_URI),
      },
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: (module: any) => module.context && module.context.indexOf('node_modules') !== -1,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      chunks: ['vendor'],
      name: 'auth0',
      minChunks: (module: any) => module.resource && (/auth0/).test(module.resource),
    }),
    new webpack.optimize.CommonsChunkPlugin({
      chunks: ['vendor'],
      name: 'react-loading',
      minChunks: (module: any) => module.resource && (/react-loading/).test(module.resource),
    }),
    new webpack.optimize.CommonsChunkPlugin({
      async: 'async-common',
      minChunks: (module: any, count: number) => count >= 2,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      title: 'Serverless API | 603.nu',
      template: path.join(__dirname, 'src', 'index.ejs'),
      favicon:  path.join(__dirname, 'src', 'favicon.ico'),
      meta: [
        {
          name: 'description',
          content: 'A simple API powered by Serverless, TypeScript, Webpack and DynamoDB, intended as a starting point for Serverless APIs',
        },
      ],
      minify: {
        collapseWhitespace: true,
      },
    }),
    new InlineChunkManifestHtmlWebpackPlugin({
      dropAsset: true,
	  }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.json'],
    modules: [
      path.join(__dirname, 'src'),
      path.join(__dirname, 'node_modules'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        loader: 'tslint-loader',
      },
      {
        test: /\.tsx?$/,
        include: path.join(__dirname, 'src'),
        use: [{
          loader: 'awesome-typescript-loader',
          options: {
            silent: true,
          },
        }],
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        include: path.join(__dirname, 'src'),
        enforce: 'pre',
      },
      {
        test: /\.css?$/,
        include: path.join(__dirname, 'src'),
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]__[hash:base64:5]',
            },
          },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/,
        include: path.join(__dirname, 'src'),
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10240,
          },
        }],
      },
    ],
  },
};

export default config;
