import { IDatabaseService } from "@/types/database.types";
import { Logger } from "winston";
import { createLoggerConfig, winstonLogConsole, winstonLogFile } from "@/logger/logger.config";
import LoggerService from "@/logger/logger.service";
import DatabaseService from "@/config/database.config";
import config from "@/config/app.config";

export interface Dependencies {
  logger: Logger;
  config: any;
  databaseService: IDatabaseService;
}

export class DIContainer {
  private static instance: DIContainer;
  private dependencies: Dependencies | null = null;

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  async initialize(): Promise<Dependencies> {
    if (this.dependencies) {
      return this.dependencies;
    }

    // loggerService creation
    const loggerService = new LoggerService(createLoggerConfig(config));

    // logger configuration for console
    loggerService.addTransport(winstonLogConsole());

    // logger configuration for file
    if (config.nodeEnv === "production") {
      loggerService.addTransport(winstonLogFile(config));
    }

    const logger = loggerService.getLogger();

    const databaseService = new DatabaseService(logger, config);

    this.dependencies = {
      logger: logger,
      config: config,
      databaseService: databaseService,
    };

    return this.dependencies;
  }

  getDependencies(): Dependencies {
    if (!this.dependencies) {
      throw new Error("Container not initialized. Call initialize() first.");
    }
    return this.dependencies;
  }

  async cleanup(): Promise<void> {
    if (this.dependencies) {
      await this.dependencies.databaseService.getClient().disconnect();
      this.dependencies = null;
    }
  }
}
