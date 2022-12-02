const Dotenv = require("dotenv-webpack");

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add the new plugin to the existing webpack plugins
    config.plugins.push(new Dotenv({ silent: true }));

    return config;
  },
  // Have to list all the environment variables used here to make them available
  // to the client side code
  env: {
    REACT_APP_API_TOKEN: process.env.REACT_APP_API_TOKEN,
  },
  target: "serverless",
  webpack5: true,
};
