/**
 * Script to batch update all files to use getPrisma() from prismaContext
 *
 * This script:
 * 1. Replaces static prisma imports with getPrisma import
 * 2. Adds const prisma = getPrisma(); at the start of each function that uses prisma
 *
 * Run with: node update-prisma-imports.js
 */

const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

// Patterns to find and replace
const patterns = [
  {
    // Replace: const { PrismaClient } = require("@prisma/client"); const prisma = new PrismaClient();
    find: /const\s*{\s*PrismaClient\s*}\s*=\s*require\(["']@prisma\/client["']\);\s*(?:const\s+prisma\s*=\s*new\s+PrismaClient\(\);)?/g,
    replace: "",
  },
  {
    // Replace: const prisma = require("../../config/prisma.config.js");
    find: /const\s+prisma\s*=\s*require\(["'][^"']*prisma\.config\.js["']\);/g,
    replace: "",
  },
  {
    // Replace: const prisma = require("../../config/db.js");
    find: /const\s+prisma\s*=\s*require\(["'][^"']*db\.js["']\);/g,
    replace: "",
  },
];

// Add getPrisma import if not present
function addGetPrismaImport(content) {
  const hasGetPrisma =
    /const\s*{\s*getPrisma\s*}\s*=\s*require\(["'][^"']*prismaContext["']\)/g.test(
      content
    );
  if (!hasGetPrisma) {
    // Find the last require statement and add after it
    const requireMatch = content.match(/const\s+\w+\s*=\s*require\([^)]+\);/g);
    if (requireMatch && requireMatch.length > 0) {
      const lastRequire = requireMatch[requireMatch.length - 1];
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
  }
  return content;
}

// Add getPrisma() call at the start of functions that use prisma
function addGetPrismaInFunctions(content) {
  // Find async functions that use prisma but don't have getPrisma() call
  const functionPattern =
    /(const\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*\{|async\s+function\s+\w+\s*\([^)]*\)\s*\{)/g;
  const prismaUsagePattern =
    /await\s+prisma\.|const\s+.*=\s*await\s+prisma\.|prisma\.\w+\./;

  let lines = content.split("\n");
  let newLines = [];
  let inFunction = false;
  let functionStartLine = -1;
  let hasGetPrisma = false;
  let hasPrismaUsage = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect function start
    if (functionPattern.test(line)) {
      inFunction = true;
      functionStartLine = i;
      hasGetPrisma = false;
      hasPrismaUsage = false;
      newLines.push(line);
      continue;
    }

    // Check if we're in a function and find prisma usage
    if (inFunction) {
      if (prismaUsagePattern.test(line) && !hasGetPrisma) {
        hasPrismaUsage = true;
      }
      if (/const\s+prisma\s*=\s*getPrisma\(\)/.test(line)) {
        hasGetPrisma = true;
      }

      // If we hit a closing brace and we're in a function
      if (
        line.trim() === "}" &&
        inFunction &&
        hasPrismaUsage &&
        !hasGetPrisma
      ) {
        // Find the first line after function start that's not empty/comment
        let insertIndex = functionStartLine + 1;
        while (
          insertIndex < i &&
          (lines[insertIndex].trim() === "" ||
            lines[insertIndex].trim().startsWith("//"))
        ) {
          insertIndex++;
        }
        // Insert getPrisma() call
        const indent = lines[insertIndex].match(/^(\s*)/)[1];
        newLines.splice(
          newLines.length - (i - insertIndex),
          0,
          indent + "const prisma = getPrisma();"
        );
        hasGetPrisma = true;
      }
    }

    newLines.push(line);

    // Reset function state on closing brace
    if (line.trim() === "}" && inFunction) {
      inFunction = false;
    }
  }

  return newLines.join("\n");
}

async function updateFiles() {
  const modelFiles = await glob("src/v1/models/*Model.js");
  const serviceFiles = await glob("src/v1/services/*Service.js");
  const controllerFiles = await glob("src/v1/controller/*Controller.js");

  const allFiles = [...modelFiles, ...serviceFiles, ...controllerFiles];

  console.log(`Found ${allFiles.length} files to update`);

  let updated = 0;
  let errors = 0;

  for (const file of allFiles) {
    try {
      let content = fs.readFileSync(file, "utf8");
      const originalContent = content;

      // Skip if already updated
      if (content.includes("getPrisma") && content.includes("prismaContext")) {
        continue;
      }

      // Apply patterns
      for (const pattern of patterns) {
        content = content.replace(pattern.find, pattern.replace);
      }

      // Add getPrisma import
      content = addGetPrismaImport(content);

      // Add getPrisma() in functions (simplified - manual review needed)
      // content = addGetPrismaInFunctions(content);

      if (content !== originalContent) {
        fs.writeFileSync(file, content, "utf8");
        updated++;
        console.log(`Updated: ${file}`);
      }
    } catch (error) {
      console.error(`Error updating ${file}:`, error.message);
      errors++;
    }
  }

  console.log(`\nCompleted: ${updated} files updated, ${errors} errors`);
  console.log(
    '\nNote: You may need to manually add "const prisma = getPrisma();" at the start of functions that use prisma.'
  );
}

updateFiles().catch(console.error);
