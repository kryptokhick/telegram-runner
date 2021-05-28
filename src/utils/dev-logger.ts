import { createLogger, format, transports } from "winston";

const { printf, combine, colorize, timestamp, errors } = format;

function createDevLogger() {
  const devLogFormat = printf(
    (log) => `${log.timestamp} ${log.level}: ${log.stack || log.message}`
  );
  return createLogger({
    level: "debug",
    format: combine(
      colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      devLogFormat
    ),
    transports: [new transports.Console()]
  });
}

export default createDevLogger;
