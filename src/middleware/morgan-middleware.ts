import morgan from "morgan";
import { Logger } from "winston";

const morganLogger = (logger: Logger, loggerConfig: string) => {
  return morgan(loggerConfig, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  });
};

export default morganLogger;
