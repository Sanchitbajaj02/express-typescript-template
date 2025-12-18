import { IDatabaseClient, IDatabaseService } from "@/types/database.types";
export default class DatabaseService implements IDatabaseService {
  constructor(private client: IDatabaseClient) {}

  getClient() {
    return this.client;
  }

  getConnection() {
    return this.client.getConnection();
  }
}
