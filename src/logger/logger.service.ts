// logger.service.js
import winston, { LoggerOptions, transport } from "winston";

export interface ILoggerService {
  addTransport(transportInfo: transport): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  http(...args: any[]): void;
  verbose(...args: any[]): void;
  debug(...args: any[]): void;
  log(logLevel: string, ...args: any[]): void;
}

export default class LoggerService implements ILoggerService {
  private logger;
  constructor(options: LoggerOptions) {
    this.logger = winston.createLogger(options);
  }

  addTransport(transportInfo: transport) {
    this.logger.add(transportInfo);
  }

  error(...args: any[]) {
    this.logger.error(args.join(' '));
  }

  warn(...args: any[]) {
    this.logger.warn(args.join(' '));
  }

  info(...args: any[]) {
    this.logger.info(args.join(' '));
  }

  http(...args: any[]) {
    this.logger.http(args.join(' '));
  }

  verbose(...args: any[]) {
    this.logger.verbose(args.join(' '));
  }

  debug(...args: any[]) {
    this.logger.debug(args.join(' '));
  }

  // log(message: string, meta?: any, logLevel: string = "debug") {
  log(logLevel: string = "debug", ...args: any[]) {
    this.logger.log(logLevel, args.join(' '));
  }
}
