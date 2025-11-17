/**
 * Script to remove all leftover "const prisma = new PrismaClient();" lines
 *
 * This script:
 * 1. Finds all .js files in src directory
 * 2. Removes lines containing "const prisma = new PrismaClient();"
 * 3. Reports all files that were cleaned
 *
 * Run with: node remove-prisma-client-lines.js
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Statistics
let stats = {
  filesProcessed: 0,
  filesFixed: 0,
  linesRemoved: 0,
  errors: 0,
};

/**
 * Check if file should be skipped
 */
function shouldSkipFile(filePath) {
  if (typeof filePath !== "string") {
    return true;
  }
  const skipPatterns = [
    "node_modules",
    ".git",
    "remove-prisma-client-lines.js",
    "update-all-prisma.js",
    "update-prisma-imports.js",
  ];
  return skipPatterns.some((pattern) => filePath.includes(pattern));
}

/**
 * Remove PrismaClient instantiation lines
 */
function removePrismaClientLines(content, filePath) {
  const lines = content.split("\n");
  const newLines = [];
  let removedCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for various patterns of PrismaClient instantiation
    const patterns = [
      /^const\s+prisma\s*=\s*new\s+PrismaClient\(\);?\s*$/,
      /^const\s+prisma\s*=\s*new\s+PrismaClient\(\)\s*;?\s*$/,
      /^\s*const\s+prisma\s*=\s*new\s+PrismaClient\(\);?\s*$/,
    ];

    let shouldRemove = false;
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        shouldRemove = true;
        removedCount++;
        break;
      }
    }

    // Also check for lines that have PrismaClient but no import
    if (
      !shouldRemove &&
      trimmed.includes("new PrismaClient()") &&
      !content.includes('require("@prisma/client")') &&
      !content.includes("require('@prisma/client')")
    ) {
      shouldRemove = true;
      removedCount++;
    }

    if (!shouldRemove) {
      newLines.push(line);
    }
  }

  return {
    content: newLines.join("\n"),
    removed: removedCount,
  };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;

    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Remove PrismaClient lines
    const { content: newContent, removed } = removePrismaClientLines(
      content,
      filePath
    );

    if (removed > 0) {
      // Also remove any empty lines that might have been left
      const cleanedContent = newContent
        .split("\n")
        .filter((line, index, arr) => {
          // Don't remove if it's the last line or if removing would create too many consecutive empty lines
          if (index === arr.length - 1) return true;
          const trimmed = line.trim();
          if (trimmed === "") {
            const nextLine = arr[index + 1]?.trim() || "";
            const prevLine = arr[index - 1]?.trim() || "";
            // Keep if it's between non-empty lines (single blank line is okay)
            if (nextLine !== "" && prevLine !== "") return true;
            // Remove if it's at the start or creates multiple empty lines
            if (prevLine === "" || nextLine === "") return false;
          }
          return true;
        })
        .join("\n");

      fs.writeFileSync(filePath, cleanedContent, "utf8");
      stats.filesFixed++;
      stats.linesRemoved += removed;
      console.log(
        `✓ Fixed: ${filePath} (removed ${removed} line${
          removed > 1 ? "s" : ""
        })`
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    stats.errors++;
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🧹 Starting cleanup script to remove PrismaClient lines...\n");

  // Find all JavaScript files
  const patterns = [
    "src/**/*.js",
    "src/v1/**/*.js",
    "src/v1/models/**/*.js",
    "src/v1/services/**/*.js",
    "src/v1/controller/**/*.js",
    "src/v1/middlewares/**/*.js",
  ];

  const allFiles = [];
  for (const pattern of patterns) {
    try {
      const files = await new Promise((resolve, reject) => {
        glob(
          pattern,
          { ignore: ["node_modules/**", ".git/**"] },
          (err, matches) => {
            if (err) reject(err);
            else resolve(matches || []);
          }
        );
      });

      if (Array.isArray(files) && files.length > 0) {
        allFiles.push(...files);
      }
    } catch (error) {
      console.error(`Error with pattern ${pattern}:`, error.message);
    }
  }

  // Remove duplicates and filter
  const uniqueFiles = Array.from(new Set(allFiles)).filter(
    (file) => !shouldSkipFile(file)
  );

  console.log(`Found ${uniqueFiles.length} files to check\n`);

  // Process each file
  for (const file of uniqueFiles) {
    processFile(file);
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files fixed: ${stats.filesFixed}`);
  console.log(`Lines removed: ${stats.linesRemoved}`);
  console.log(`Errors: ${stats.errors}`);
  console.log("\n✅ Cleanup complete!");

  if (stats.filesFixed > 0) {
    console.log("\n⚠️  Please restart your application to verify the fixes.");
  } else {
    console.log("\n✨ No issues found! All files are clean.");
  }
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
