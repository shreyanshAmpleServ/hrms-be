/**
 * Comprehensive script to update ALL files to use getPrisma() from prismaContext
 *
 * This script:
 * 1. Replaces static prisma imports with getPrisma import
 * 2. Removes prisma parameters from function signatures
 * 3. Adds const prisma = getPrisma(); at the start of functions that use prisma
 * 4. Updates all function calls to remove prisma parameter
 *
 * Run with: node update-all-prisma.js
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Statistics
let stats = {
  filesProcessed: 0,
  filesUpdated: 0,
  functionsUpdated: 0,
  importsReplaced: 0,
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
    "update-all-prisma.js",
    "update-prisma-imports.js",
    "prismaContext.js",
    "tenantMiddleware.js",
  ];
  return skipPatterns.some((pattern) => filePath.includes(pattern));
}

/**
 * Replace static Prisma imports
 */
function replacePrismaImports(content) {
  let updated = false;

  // Pattern 1: const { PrismaClient } = require("@prisma/client"); const prisma = new PrismaClient();
  const pattern1 =
    /const\s*{\s*PrismaClient\s*}\s*=\s*require\(["']@prisma\/client["']\);\s*(?:const\s+prisma\s*=\s*new\s+PrismaClient\(\);)?/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, "");
    updated = true;
    stats.importsReplaced++;
  }

  // Pattern 2: const prisma = require("../../config/prisma.config.js");
  const pattern2 =
    /const\s+prisma\s*=\s*require\(["'][^"']*prisma\.config\.js["']\);/g;
  if (pattern2.test(content)) {
    content = content.replace(pattern2, "");
    updated = true;
    stats.importsReplaced++;
  }

  // Pattern 3: const prisma = require("../../config/db.js");
  const pattern3 = /const\s+prisma\s*=\s*require\(["'][^"']*db\.js["']\);/g;
  if (pattern3.test(content)) {
    content = content.replace(pattern3, "");
    updated = true;
    stats.importsReplaced++;
  }

  return { content, updated };
}

/**
 * Add getPrisma import if not present
 */
function addGetPrismaImport(content) {
  const hasGetPrisma =
    /const\s*{\s*getPrisma\s*}\s*=\s*require\(["'][^"']*prismaContext["']\)/g.test(
      content
    );

  if (hasGetPrisma) {
    return content;
  }

  // Find the last require statement
  const requireMatches = content.match(/const\s+\w+\s*=\s*require\([^)]+\);/g);
  if (requireMatches && requireMatches.length > 0) {
    const lastRequire = requireMatches[requireMatches.length - 1];
    const lastRequireIndex = content.lastIndexOf(lastRequire);
    const insertIndex = content.indexOf("\n", lastRequireIndex) + 1;
    const importLine =
      'const { getPrisma } = require("../../config/prismaContext.js");\n';
    content =
      content.slice(0, insertIndex) + importLine + content.slice(insertIndex);
  } else {
    // Add at the top if no requires found
    content =
      'const { getPrisma } = require("../../config/prismaContext.js");\n' +
      content;
  }

  return content;
}

/**
 * Add getPrisma() call in functions that use prisma
 */
function addGetPrismaInFunctions(content) {
  const lines = content.split("\n");
  const newLines = [];
  let braceCount = 0;
  let inFunction = false;
  let functionStartIndex = -1;
  let hasGetPrisma = false;
  let hasPrismaUsage = false;
  let functionIndent = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect function start (async function or const x = async)
    const functionPattern =
      /^(const\s+\w+\s*=\s*async\s*\(|async\s+function\s+\w+\s*\(|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{|function\s+\w+\s*\()/;
    if (functionPattern.test(trimmed) && !inFunction) {
      inFunction = true;
      functionStartIndex = i;
      hasGetPrisma = false;
      hasPrismaUsage = false;
      functionIndent = line.match(/^(\s*)/)[1];
      newLines.push(line);
      braceCount =
        (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      continue;
    }

    // Track braces
    if (inFunction) {
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      // Check for prisma usage
      if (
        /await\s+prisma\.|const\s+.*=\s*await\s+prisma\.|prisma\.\w+\.|prisma\.\$/.test(
          line
        ) &&
        !hasGetPrisma
      ) {
        hasPrismaUsage = true;
      }

      // Check if getPrisma() is already called
      if (/const\s+prisma\s*=\s*getPrisma\(\)/.test(line)) {
        hasGetPrisma = true;
      }

      // If we're closing the function and we used prisma but didn't call getPrisma
      if (braceCount === 0 && inFunction && hasPrismaUsage && !hasGetPrisma) {
        // Find where to insert (after function declaration and opening brace)
        let insertAfter = functionStartIndex + 1;
        while (
          insertAfter < i &&
          (lines[insertAfter].trim() === "" ||
            lines[insertAfter].trim().startsWith("//") ||
            lines[insertAfter].trim().startsWith("*"))
        ) {
          insertAfter++;
        }

        // Get the indent from the line we're inserting after
        const insertIndent =
          lines[insertAfter].match(/^(\s*)/)[1] || functionIndent + "  ";

        // Insert getPrisma() call
        const insertLine = insertIndent + "const prisma = getPrisma();";
        const insertPosition = newLines.length - (i - insertAfter);
        newLines.splice(insertPosition, 0, insertLine);
        hasGetPrisma = true;
        stats.functionsUpdated++;
      }
    }

    newLines.push(line);

    // Reset function state when we close all braces
    if (braceCount === 0 && inFunction) {
      inFunction = false;
      hasGetPrisma = false;
      hasPrismaUsage = false;
    }
  }

  return newLines.join("\n");
}

/**
 * Remove prisma parameter from function signatures
 */
function removePrismaParameter(content) {
  // Pattern: function name(prisma, ...) or async function name(prisma, ...)
  const patterns = [
    // const func = async (prisma, ...) =>
    /(const\s+\w+\s*=\s*async\s*\()\s*prisma\s*,/g,
    // async function name(prisma, ...)
    /(async\s+function\s+\w+\s*\()\s*prisma\s*,/g,
    // function name(prisma, ...)
    /(function\s+\w+\s*\()\s*prisma\s*,/g,
    // const func = (prisma, ...) =>
    /(const\s+\w+\s*=\s*\()\s*prisma\s*,/g,
  ];

  let updated = false;
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, "$1");
      updated = true;
    }
  }

  // Also handle standalone prisma parameter: (prisma) => or (prisma) {
  content = content.replace(/\(\s*prisma\s*\)\s*=>/g, "() =>");
  content = content.replace(/\(\s*prisma\s*\)\s*\{/g, "() {");

  return { content, updated };
}

/**
 * Remove prisma from function calls
 */
function removePrismaFromCalls(content) {
  let updated = false;

  // Pattern: functionName(prisma, ...) - but be careful not to match inside strings
  // This is a simplified approach - might need refinement
  const callPatterns = [
    // await model.func(prisma, ...
    /(await\s+\w+\.\w+\()\s*prisma\s*,/g,
    // model.func(prisma, ...
    /(\w+\.\w+\()\s*prisma\s*,/g,
    // func(prisma, ...
    /(\b\w+\()\s*prisma\s*,/g,
  ];

  for (const pattern of callPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, "$1");
      updated = true;
    }
  }

  // Handle standalone prisma in calls: func(prisma)
  content = content.replace(/\(\s*prisma\s*\)/g, "()");

  return { content, updated };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;

    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Skip if already updated (has getPrisma and prismaContext)
    if (
      content.includes("getPrisma") &&
      content.includes("prismaContext") &&
      !content.includes("new PrismaClient()") &&
      !content.includes("require.*prisma.config")
    ) {
      return;
    }

    // Step 1: Replace Prisma imports
    const { content: content1, updated: importUpdated } =
      replacePrismaImports(content);
    content = content1;

    // Step 2: Add getPrisma import
    content = addGetPrismaImport(content);

    // Step 3: Remove prisma parameter from function signatures
    const { content: content2, updated: paramUpdated } =
      removePrismaParameter(content);
    content = content2;

    // Step 4: Remove prisma from function calls
    const { content: content3, updated: callUpdated } =
      removePrismaFromCalls(content);
    content = content3;

    // Step 5: Add getPrisma() in functions
    content = addGetPrismaInFunctions(content);

    // Write if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      stats.filesUpdated++;
      console.log(`✓ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Starting Prisma migration script...\n");

  // Find all relevant files
  const patterns = [
    "src/v1/models/**/*.js",
    "src/v1/services/**/*.js",
    "src/v1/controller/**/*.js",
    "src/v1/middlewares/**/*.js",
  ];

  const allFiles = [];
  for (const pattern of patterns) {
    try {
      // Use callback-based glob
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

  console.log(`Found ${uniqueFiles.length} files to process\n`);

  // Process each file
  for (const file of uniqueFiles) {
    processFile(file);
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files updated: ${stats.filesUpdated}`);
  console.log(`Functions updated: ${stats.functionsUpdated}`);
  console.log(`Imports replaced: ${stats.importsReplaced}`);
  console.log(`Errors: ${stats.errors}`);
  console.log("\n✅ Migration complete!");
  console.log(
    "\n⚠️  NOTE: Please review the changes and test your application."
  );
  console.log("    Some edge cases may need manual adjustment.");
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
