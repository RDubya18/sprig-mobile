module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".ts", ".tsx", ".js", ".json"],
          alias: {
            lib: "./lib",
            db: "./db",
            data: "./data",
            components: "./components",
            screens: "./screens"
          }
        }
      ]
    ]
  };
};
