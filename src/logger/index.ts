import { createLoggerConfig, winstonLogConsole, winstonLogFile } from "./logger.config";
import LoggerService from "./logger.service";

const logger = new LoggerService(createLoggerConfig())

// logger configuration for console
logger.addTransport(winstonLogConsole());

// logger configuration for file
if (process.env.NODE_ENV === "production") {
  logger.addTransport(winstonLogFile("logs/error.log"));
}

export default logger.getLogger();