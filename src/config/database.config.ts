import { IDatabaseClient, IDatabaseService } from "@/types/database.types";
import { AppLogger } from "@/types/logger.types";
import { StatusCodes } from "http-status-codes";
import CustomError from "@/lib/custom-error";

class DatabaseClientImpl implements IDatabaseClient {
  private connected = false;
  private logger: AppLogger;
  private config: any;

  constructor(logger: AppLogger, config: any) {
    this.logger = logger;
    this.config = config;
  }

  /**
 * @param connectionURL string
 * @param connectionType string
 * @param params any
 */
  async createConnection(): Promise<void> {
    try {
      const { connectionURL, connectionType, params } = this.config.database;

      if (!connectionURL) {
        this.logger.warn("No database connection URL provided, skipping connection");
        return;
      }

      this.logger.info(`Connecting to ${connectionType} database...`);

      /**
       * Write the actual connection logic here
      */

      this.connected = true;
      this.logger.info("Database connected successfully");
    } catch (error) {
      this.logger.error("Failed to connect to database", { error });
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error in creation of Database Connection");
    }
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      this.logger.info("Disconnecting from database...");

      /**
       * Write the actual disconnection logic here
       */

      this.connected = false;
      this.logger.info("Database disconnected");
    }
  }

  /**
   * Check if the database is connected
   * @returns boolean
   */
  isConnected(): boolean {
    return this.connected;
  }
}

export default class DatabaseService implements IDatabaseService {
  private client: IDatabaseClient;

  constructor(logger: AppLogger, config: any) {
    this.client = new DatabaseClientImpl(logger, config);
  }

  getClient(): IDatabaseClient {
    return this.client;
  }
} 