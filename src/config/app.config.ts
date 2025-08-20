import { AppConfig, IConfigService } from "@/types/config.types";

export default class AppConfigService implements IConfigService {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private getEnv = <T>(key: string, defaultValue?: T): T => {
    const value = process.env[key] || defaultValue;

    if (value === undefined) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    return value as T;
  };


  private loadConfig(): AppConfig {
    return {
      port: this.getEnv<number>("PORT", 5000),
      nodeEnv: this.getEnv<string>("NODE_ENV", "development"),
      rateLimit: {
        limit: this.getEnv<number>("RATE_LIMIT_LIMIT", 10),
        windowSeconds: this.getEnv<number>("RATE_LIMIT_WINDOW_SECONDS", 300),
      },
      database: {
        connectionURL: this.getEnv<string>("DATABASE_URL", ""),
        connectionType: this.getEnv<string>("DATABASE_TYPE", "postgres"),
      },
      security: {
        allowedOrigins: this.getEnv<string[]>("ALLOWED_ORIGINS", []),
        blockOnThreat: this.getEnv<boolean>("BLOCK_ON_THREAT", false),
        logThreats: this.getEnv<boolean>("LOG_THREATS", true),
      },
    };
  }

  getConfig(): AppConfig {
    return this.config;
  }
} 