/**
 * Script to fix syntax errors where "const prisma = getPrisma();"
 * was incorrectly placed inside function parameters
 *
 * This script:
 * 1. Finds lines with "const prisma = getPrisma();" inside function parameters
 * 2. Moves them to the correct location (inside function body)
 * 3. Reports all files that were fixed
 *
 * Run with: node fix-syntax-errors.js
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Statistics
let stats = {
  filesProcessed: 0,
  filesFixed: 0,
  errorsFixed: 0,
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
    "fix-syntax-errors.js",
    "remove-prisma-client-lines.js",
    "update-all-prisma.js",
    "update-prisma-imports.js",
  ];
  return skipPatterns.some((pattern) => filePath.includes(pattern));
}

/**
 * Fix syntax errors in function parameters
 */
function fixSyntaxErrors(content, filePath) {
  // Use regex to find and fix the pattern: async ({ const prisma = getPrisma(); ... })
  const pattern =
    /(const\s+\w+\s*=\s*async\s*\(\{|\w+\s*=\s*async\s*\(\{)\s*\n\s*const\s+prisma\s*=\s*getPrisma\(\);\s*\n/g;

  let fixedCount = 0;
  let newContent = content;

  // Find all matches
  const matches = [...content.matchAll(pattern)];

  for (const match of matches) {
    const matchIndex = match.index;
    const matchText = match[0];

    // Find the closing of the parameter list
    let searchIndex = matchIndex + matchText.length;
    let braceCount = 1; // We're inside { already
    let foundClosing = false;
    let closingIndex = -1;

    // Find where the parameter list closes
    while (searchIndex < content.length && !foundClosing) {
      const char = content[searchIndex];
      if (char === "{") braceCount++;
      if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          // Check if next is => or )
          let nextNonWhitespace = searchIndex + 1;
          while (
            nextNonWhitespace < content.length &&
            /\s/.test(content[nextNonWhitespace])
          ) {
            nextNonWhitespace++;
          }
          if (
            content[nextNonWhitespace] === ")" ||
            content.substring(nextNonWhitespace, nextNonWhitespace + 2) === "})"
          ) {
            closingIndex = nextNonWhitespace;
            foundClosing = true;
          }
        }
      }
      searchIndex++;
    }

    if (foundClosing) {
      // Find where function body starts (after => {)
      let bodyStart = closingIndex + 1;
      while (bodyStart < content.length && /\s/.test(content[bodyStart])) {
        bodyStart++;
      }

      // Check if there's => {
      if (content.substring(bodyStart, bodyStart + 3) === "=> ") {
        bodyStart += 3;
        while (bodyStart < content.length && /\s/.test(content[bodyStart])) {
          bodyStart++;
        }
        if (content[bodyStart] === "{") {
          bodyStart++;
        }
      }

      // Get the line after function body opening
      const beforeBody = content.substring(0, bodyStart);
      const afterBody = content.substring(bodyStart);

      // Find first non-empty line in body to get indent
      const bodyLines = afterBody.split("\n");
      let bodyIndent = "  ";
      for (const bodyLine of bodyLines) {
        if (bodyLine.trim() && !bodyLine.trim().startsWith("//")) {
          bodyIndent = bodyLine.match(/^(\s*)/)?.[1] || "  ";
          break;
        }
      }

      // Remove const prisma from parameters
      const fixedParams = matchText.replace(
        /\s*\n\s*const\s+prisma\s*=\s*getPrisma\(\);\s*\n/,
        "\n"
      );

      // Insert const prisma at start of function body
      const newBody = bodyIndent + "const prisma = getPrisma();\n" + afterBody;

      // Reconstruct
      newContent = beforeBody.replace(matchText, fixedParams) + newBody;
      fixedCount++;

      // Update content for next iteration
      content = newContent;
    }
  }

  // Also handle simpler pattern: lines with const prisma = getPrisma(); followed by parameter
  const lines = newContent.split("\n");
  const finalLines = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this line has function with destructured params and next line has const prisma
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      const nextTrimmed = nextLine.trim();

      // Pattern: async ({  followed by const prisma = getPrisma();
      if (
        (trimmed.includes("async ({") || trimmed.includes("= async ({")) &&
        /const\s+prisma\s*=\s*getPrisma\(\)/.test(nextTrimmed)
      ) {
        // Skip the prisma line in params, we'll add it later
        finalLines.push(line);
        i += 2; // Skip both the function declaration and prisma line

        // Find where params end
        let paramEnd = i;
        let braceCount = (line.match(/\{/g) || []).length;

        while (paramEnd < lines.length && braceCount > 0) {
          braceCount += (lines[paramEnd].match(/\{/g) || []).length;
          braceCount -= (lines[paramEnd].match(/\}/g) || []).length;
          if (braceCount === 0 && lines[paramEnd].includes("})")) {
            break;
          }
          paramEnd++;
        }

        // Add all param lines
        while (i <= paramEnd) {
          finalLines.push(lines[i]);
          i++;
        }

        // Find function body start
        let bodyStart = i;
        while (
          bodyStart < lines.length &&
          (lines[bodyStart].trim() === "" ||
            lines[bodyStart].trim().startsWith("//") ||
            lines[bodyStart].trim() === "=>")
        ) {
          if (lines[bodyStart].trim() === "=>") {
            bodyStart++;
            continue;
          }
          bodyStart++;
        }

        // Get indent for body
        const bodyIndent = lines[bodyStart]?.match(/^(\s*)/)?.[1] || "  ";

        // Add prisma line at body start
        finalLines.push(bodyIndent + "const prisma = getPrisma();");
        fixedCount++;
        continue;
      }
    }

    finalLines.push(line);
    i++;
  }

  return {
    content: finalLines.join("\n"),
    fixed: fixedCount,
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

    // Fix syntax errors
    const { content: newContent, fixed } = fixSyntaxErrors(content, filePath);

    if (fixed > 0) {
      fs.writeFileSync(filePath, newContent, "utf8");
      stats.filesFixed++;
      stats.errorsFixed += fixed;
      console.log(
        `✓ Fixed: ${filePath} (fixed ${fixed} syntax error${
          fixed > 1 ? "s" : ""
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
  console.log("🔧 Starting syntax error fix script...\n");

  // Find all JavaScript files
  const patterns = [
    "src/**/*.js",
    "src/v1/**/*.js",
    "src/v1/models/**/*.js",
    "src/v1/services/**/*.js",
    "src/v1/controller/**/*.js",
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
  console.log(`Syntax errors fixed: ${stats.errorsFixed}`);
  console.log(`Errors: ${stats.errors}`);
  console.log("\n✅ Fix complete!");

  if (stats.filesFixed > 0) {
    console.log("\n⚠️  Please restart your application to verify the fixes.");
  } else {
    console.log("\n✨ No syntax errors found!");
  }
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
