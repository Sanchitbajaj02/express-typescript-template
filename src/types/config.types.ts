export interface AppConfig {
  port: number;
  nodeEnv: string;
  rateLimit: {
    limit: number;
    windowSeconds: number;
  };
  database: {
    connectionURL: string;
    connectionType: string;
    params?: any;
  };
  security: {
    allowedOrigins: string[];
    blockOnThreat: boolean;
    logThreats: boolean;
  };
}

export interface IConfigService {
  getConfig(): AppConfig;
} 