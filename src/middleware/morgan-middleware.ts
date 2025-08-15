import morgan from "morgan";
import logger from "@/logger";

const morganLogger = (loggerConfig: string) => {
  return morgan(loggerConfig, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  });
};

export default morganLogger;
