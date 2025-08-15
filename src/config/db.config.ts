export default class Database {
  /**
   * 
   * @param connectionURL string
   * @param connectionType string
   * @param params any
   */
  private async createConnection(
    connectionURL: string,
    connectionType: string,
    params?: unknown[]
  ) {
    // create connection according to requirement
  }

  public async connectToDatabase() {
    const connectionURL: string = ""
    const connectionType: string = ""
    try {
      await this.createConnection(connectionURL, connectionType)
    } catch (error: any) {
      throw new Error("Error in creation of Database Connection")
    }
  }
}