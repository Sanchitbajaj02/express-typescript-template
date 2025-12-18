import morgan from "morgan";
import { Logger } from "winston";

export default class MorganLogger {
  private logger: Logger;
  private morganLogConfig: string;

  constructor(logger: Logger, morganLogConfig: string) {
    this.logger = logger;
    this.morganLogConfig = morganLogConfig;
  }

  public createMorganMiddleware() {
    return morgan(this.morganLogConfig, {
      stream: {
        write: (message) => this.logger.http(message.trim()),
      },
    });
  }
}
