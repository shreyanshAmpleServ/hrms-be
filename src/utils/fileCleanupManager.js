const fs = require("fs");
const path = require("path");

class FileCleanupManager {
  constructor() {
    this.scheduledCleanups = new Map();
  }

  scheduleCleanup(filePath, delayMs = 300000, description = "File") {
    if (this.scheduledCleanups.has(filePath)) {
      clearTimeout(this.scheduledCleanups.get(filePath));
    }

    const timeoutId = setTimeout(() => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Auto-cleaned ${description}: ${filePath}`);
        } else {
          console.log(`${description} already deleted: ${filePath}`);
        }
      } catch (cleanupError) {
        console.error(
          `Error cleaning up ${description} ${filePath}:`,
          cleanupError,
        );
      } finally {
        this.scheduledCleanups.delete(filePath);
      }
    }, delayMs);

    this.scheduledCleanups.set(filePath, timeoutId);
    console.log(
      `Scheduled cleanup for ${description} in ${delayMs / 1000} seconds: ${filePath}`,
    );
  }

  cancelCleanup(filePath) {
    if (this.scheduledCleanups.has(filePath)) {
      clearTimeout(this.scheduledCleanups.get(filePath));
      this.scheduledCleanups.delete(filePath);
      console.log(`Cancelled cleanup for: ${filePath}`);
      return true;
    }
    return false;
  }

  getScheduledCleanupCount() {
    return this.scheduledCleanups.size;
  }

  cancelAllCleanups() {
    for (const [filePath, timeoutId] of this.scheduledCleanups) {
      clearTimeout(timeoutId);
    }
    this.scheduledCleanups.clear();
    console.log("Cancelled all scheduled cleanups");
  }

  cleanupOldFiles(directory, maxAgeMs = 300000) {
    try {
      if (!fs.existsSync(directory)) {
        return;
      }

      const files = fs.readdirSync(directory);
      const now = Date.now();
      let cleanedCount = 0;

      files.forEach((file) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAgeMs) {
          try {
            if (stats.isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(filePath);
            }
            cleanedCount++;
            console.log(`Cleaned old file: ${filePath}`);
          } catch (error) {
            console.error(`Error cleaning old file ${filePath}:`, error);
          }
        }
      });

      if (cleanedCount > 0) {
        console.log(`Cleaned ${cleanedCount} old files from ${directory}`);
      }
    } catch (error) {
      console.error(`Error in cleanupOldFiles for ${directory}:`, error);
    }
  }
}

const cleanupManager = new FileCleanupManager();

setInterval(() => {
  cleanupManager.cleanupOldFiles(path.join(process.cwd(), "pdfs"), 300000);

  cleanupManager.cleanupOldFiles(path.join(process.cwd(), "temp"), 300000);

  cleanupManager.cleanupOldFiles(
    path.join(process.cwd(), "uploads", "bulk-downloads"),
    300000,
  );
}, 600000);

module.exports = cleanupManager;
