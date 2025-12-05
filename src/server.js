// const app = require("./app");
// const logger = require("./Comman/logger");
// const { initializeCronJobs } = require("./cronjobs");
// const { disconnectAll } = require("./config/db.js");

// const PORT = process.env.PORT || 5000;

// const server = app.listen(PORT, "0.0.0.0", async () => {
//   initializeCronJobs();
//   logger.info(`Server is running on http://localhost:${PORT}`);
// });
// const gracefulShutdown = async (signal) => {
//   logger.info(`${signal} received. Starting graceful shutdown...`);

//   server.close(async () => {
//     logger.info("HTTP server closed");
//     try {
//       await disconnectAll();
//       logger.info("All database connections closed successfully");
//       process.exit(0);
//     } catch (error) {
//       logger.error("Error during database disconnection:", error);
//       process.exit(1);
//     }
//   });

//   setTimeout(() => {
//     logger.error("Forced shutdown after timeout");
//     process.exit(1);
//   }, 30000);
// };

// process.on("SIGINT", () => gracefulShutdown("SIGINT"));
// process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// process.on("unhandledRejection", (reason, promise) => {
//   logger.error("Unhandled Rejection at:", promise, "reason:", reason);
//   gracefulShutdown("unhandledRejection");
// });

process.on("uncaughtException", (err) => {
  console.error("\n\n UNCAUGHT EXCEPTION");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("\n\n");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("\n\n UNHANDLED REJECTION");
  console.error("Reason:", reason);
  console.error("\n\n");
  process.exit(1);
});

const logger = require("./Comman/logger");

logger.info("Loading app.");
const app = require("./app");
logger.success("App loaded");

const { initializeCronJobs } = require("./cronjobs");
logger.success("Cronjobs loaded");

const { disconnectAll } = require("./config/db.js");
logger.success("DB loaded");

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
