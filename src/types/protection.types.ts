export type SanitizeOptions = {
  blockOnThreat: boolean;
  logThreats: boolean;
  skipRoutes?: string[];
  failSecurely?: boolean;
};

export type CorsOptions = {
  allowedOrigins: string[];
  credentials: boolean;
};

export type XssOptions = {
  whiteList?: any;
  stripIgnoreTag?: boolean;
  allowCommentTag?: boolean;
  css?: boolean;
  stripIgnoreTagBody?: string[];
};