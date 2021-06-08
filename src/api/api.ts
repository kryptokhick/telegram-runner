import express from "express";
import config from "../Config";
import logger from "../utils/logger";
// import router from "./router";

export default () => {
  const api = express();

  api.use(express.json());

  // TODO: implement router
  // api.use(config.api.prefix, router());

  api.listen(config.api.port, () =>
    logger.info(`API listening on ${config.api.port}`)
  );

  return api;
};
