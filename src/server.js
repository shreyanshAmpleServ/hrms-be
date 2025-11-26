const app = require("./app");
const logger = require("./Comman/logger");
const { initializeCronJobs } = require("./cronjobs");
const { disconnectAll } = require("./config/db.js");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", async () => {
  initializeCronJobs();
  logger.info(`Server is running on http://localhost:${PORT}`);
});
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed");
    try {
      await disconnectAll();
      logger.info("All database connections closed successfully");
      process.exit(0);
    } catch (error) {
      logger.error("Error during database disconnection:", error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});
