import "dotenv/config";
import "module-alias/register";
import { DIContainer } from "@/container/di.container";
import { createApp } from "@/app.factory";

async function startServer() {
  try {
    // Initialize dependency injection container
    const container = DIContainer.getInstance();
    const deps = await container.initialize();

    // Create Express app with injected dependencies
    const app = createApp(deps);

    // Start server
    const port = deps.config.port;
    const server = app.listen(port, async () => {
      deps.logger.info(`Server running on http://localhost:${port}`);

      // Connect to database
      await deps.databaseService.getClient().createConnection();
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      deps.logger.info("SIGTERM received, shutting down gracefully");
      server.close(async () => {
        await container.cleanup();
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      deps.logger.info("SIGINT received, shutting down gracefully");
      server.close(async () => {
        await container.cleanup();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
