import winston, { LoggerOptions } from "winston";


const baseFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss A" })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf((options: any) => {
    return `Time: ${options.timestamp} PID: ${process.pid} [${options.level}]: ${options.message} ${options.stack || ""}`;
  })
);

const fileFormat = winston.format.combine(winston.format.json());

export function createLoggerConfig(appConfig: any) {
  const config: LoggerOptions = {
    levels: appConfig.logger.levels,
    level: appConfig.logger.consoleLogLevel,
    format: baseFormat,
  };

  return config;
}

export const winstonLogConsole = () => {
  return new winston.transports.Console({
    format: consoleFormat,
  });
};

export const winstonLogFile = (appConfig: any) => {
  return new winston.transports.File({
    filename: `${appConfig.logger.logFolderPath}/${appConfig.logger.logFileName}`,
    level: appConfig.logger.fileLogLevel,
    format: fileFormat,
  });
};
