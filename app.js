"use strict";
const path = require("path");

module.exports = (agenda, options) => {
  options = options || {};
  if (!options.middleware) {
    options.middleware = "express";
  }
  if (!options.apiMiddleware) {
    options.apiMiddleware = [];
  }

  const agendash = require("./lib/controllers/agendash")(agenda, options);
  const middlewarePath = path.join(
    __dirname,
    "./lib/middlewares",
    options.middleware
  );

  try {
    return require(middlewarePath)(agendash, options);
  } catch (error) {
    console.error(error);
    throw new Error(`Middleware load failed with ${JSON.stringify(options)}`);
  }
};
