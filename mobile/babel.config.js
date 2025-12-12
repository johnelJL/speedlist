// Babel configuration used by the Expo bundler.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: []
  };
};
