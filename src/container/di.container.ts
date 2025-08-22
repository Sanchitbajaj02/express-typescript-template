import { AppLogger, LoggerService } from "@/types/logger.types";
import { IDatabaseService } from "@/types/database.types";

export interface Dependencies {
  logger: AppLogger;
  loggerService: LoggerService;
  config: any;
  databaseService: IDatabaseService;
}

export class DIContainer {
  private static instance: DIContainer;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}
