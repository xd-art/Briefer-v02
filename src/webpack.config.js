// This is a simplified webpack configuration for demonstration purposes
// In a real CRA project, this would be handled by react-scripts
// But we can show what optimizations would look like

const path = require('path');

module.exports = {
  // Entry points for code splitting
  entry: {
    main: './src/index.js',
    editor: './src/components/CardEditor.js',
    // Other chunks can be added here
  },
  
  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
  },
  
  // Optimization settings
  optimization: {
    // Split chunks for better caching
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        quill: {
          test: /[\\/]node_modules[\\/](quill|react-quill)[\\/]/,
          name: 'quill',
          chunks: 'all',
        },
      },
    },
    
    // Minimize output
    minimize: true,
    
    // Runtime chunk for better caching
    runtimeChunk: 'single',
  },
  
  // Module rules
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              // Plugin for code splitting
              '@babel/plugin-syntax-dynamic-import',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  
  // Resolve configuration
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};