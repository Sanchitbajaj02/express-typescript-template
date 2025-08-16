// logger.service.js
import winston, { LoggerOptions, Logger, transport } from "winston";

export interface ILoggerService {
  addTransport: (transportInfo: transport) => void;
  log: (logLevel: string, message: string, meta?: any[]) => void;
  getLogger: () => Logger;
}

export default class LoggerService implements ILoggerService {
  private logger: Logger;
  
  constructor(options: LoggerOptions) {
    this.logger = winston.createLogger(options);
  }

  addTransport(transportInfo: transport) {
    this.logger.add(transportInfo);
  }

  log(logLevel: string = "debug", message: string, meta: any = {}) {
    this.logger.log({ level: logLevel, message, ...meta });
  }

  getLogger() {
    return this.logger;
  }
}
