export interface IDatabaseClient {
  createConnection(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export interface IDatabaseService {
  getClient(): IDatabaseClient;
} 