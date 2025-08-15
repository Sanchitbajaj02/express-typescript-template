// logger.service.js
import winston, { LoggerOptions, transport } from "winston";

export default class LoggerService {
  private logger;
  constructor(options: LoggerOptions) {
    this.logger = winston.createLogger(options);
  }

  addTransport(transportInfo: transport) {
    this.logger.add(transportInfo);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  http(message: string, meta?: any) {
    this.logger.http(message, meta);
  }

  verbose(message: string, meta?: any) {
    this.logger.verbose(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  log(message: string, meta?: any, logLevel: string = "debug") {
    this.logger.log(logLevel, message, meta);
  }
}
