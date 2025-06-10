const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/app.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new MiniCssExtractPlugin({ filename: "styles.css" }),
  ],
  module: {
    rules: [
      { test: /\.html$/i, loader: "html-loader" },
      {
        test: /\.css$/i,
        use: [
          process.env.NODE_ENV === "production"
            ? MiniCssExtractPlugin.loader
            : "style-loader",
          "css-loader",
        ],
      },
      { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: "asset/resource" },
      { test: /\.(png|jpe?g|gif|svg)$/i, type: "asset/resource" },
    ],
  },
  optimization: { minimize: true },
};
