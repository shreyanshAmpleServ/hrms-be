const app = require("./app");
const logger = require("./Comman/logger");
const { initializeCronJobs } = require("./cronjobs");

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  initializeCronJobs();
});

// const app = require("./app");
// const logger = require("./Comman/logger");
// const { initializeCronJobs } = require("./cronjobs");
// const { startScheduler } = require("./v1/services/alertWorkflowService.js");

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, "0.0.0.0", async () => {
//   logger.info(`Server is running on http://localhost:${PORT}`);

//   initializeCronJobs();

//   try {
//     await startScheduler();
//     logger.info(" Alert workflow scheduler started successfully");
//   } catch (error) {
//     logger.error(" Failed to start alert workflow scheduler:", error);
//   }
// });
