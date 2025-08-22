const getEnv = <T>(key: string, defaultValue?: T): T => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value as T;
};

const config: any = {};

config.port = getEnv<number>("PORT", 5000);
config.nodeEnv = getEnv<string>("NODE_ENV", "development");
config.rateLimit = {
  limit: getEnv<number>("RATE_LIMIT_LIMIT", 10),
  windowSeconds: getEnv<number>("RATE_LIMIT_WINDOW_SECONDS", 300),
};
config.database = {
  connectionURL: getEnv<string>("DATABASE_URL", ""),
  connectionType: getEnv<string>("DATABASE_TYPE", "mongodb"),
};

config.security = {
  allowedOrigins: getEnv<string[]>("ALLOWED_ORIGINS", []),
  blockOnThreat: getEnv<boolean>("BLOCK_ON_THREAT", false),
  logThreats: getEnv<boolean>("LOG_THREATS", true),
};

config.environment = getEnv<string>("NODE_ENV", "development");

config.logger = {
  consoleLogLevel: "debug",
  fileLogLevel: "info",
  logFolderPath: "logs",
  logFileName: "error.log",
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
};

export default config;
