export interface IDatabaseClient {
  createConnection(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnection(): Promise<any>
}

export interface IDatabaseService {
  getClient(): IDatabaseClient;
  getConnection(): Promise<any>;
} 