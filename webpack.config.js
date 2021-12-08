const config = {
  entry: "./public/index.js",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  mode: "production"
};
module.exports = config;