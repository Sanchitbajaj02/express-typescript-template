import { IDatabaseClient, IDatabaseService } from "@/types/database.types";

export default class DatabaseService implements IDatabaseService {
  private client: IDatabaseClient;

  constructor(
    client: IDatabaseClient
  ) {
    this.client = client;
  }

  getClient(): IDatabaseClient {
    return this.client;
  }
} 