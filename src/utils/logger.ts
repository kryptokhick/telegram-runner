import createDevLogger from "./dev-logger";

const logger =
  process.env.NODE_ENV === "development"
    ? createDevLogger()
    : // TODO: production logger
      createDevLogger();

export default logger;
