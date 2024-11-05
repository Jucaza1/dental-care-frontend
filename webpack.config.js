const path = require('path')

module.exports = {
  entry: './src/index.ts',                // Entry point for bundling
  output: {
    filename: 'bundle.js',                // Output bundle name
    path: path.resolve(__dirname, 'public/dist') // Output path
  },
  module: {
    rules: [
      {
        test: /\.ts$/,                  // Load .ts files
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']    // Resolve these file extensions
  },
  devtool: 'source-map'                   // Generate source maps
};
