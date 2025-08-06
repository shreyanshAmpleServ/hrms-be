const app = require("./app");
const logger = require("./Comman/logger");

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
