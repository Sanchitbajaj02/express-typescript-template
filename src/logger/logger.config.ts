import winston, { LoggerOptions } from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

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

const LOG_CONFIG_LEVEL: string = "debug";
const FILE_LEVEL: string = "info";

export function createLoggerConfig() {
  const config: LoggerOptions = {
    levels,
    level: LOG_CONFIG_LEVEL,
    format: baseFormat,
  };

  return config;
}

export const winstonLogConsole = () => {
  return new winston.transports.Console({
    format: consoleFormat,
  });
};

export const winstonLogFile = (filename: string) => {
  return new winston.transports.File({
    filename: filename,
    level: FILE_LEVEL,
    format: fileFormat,
  });
};
