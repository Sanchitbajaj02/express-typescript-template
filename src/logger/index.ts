import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

export const logger = winston.createLogger({
  levels: levels,
  level: "debug",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss A" }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level}]: ${message} ${stack || ""}`;
    })
  ),
  transports: [new winston.transports.File({ filename: "logs/error.log", })],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console());
}
