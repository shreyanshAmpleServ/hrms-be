const { AsyncLocalStorage } = require("async_hooks");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

// Create async local storage for request context
const prismaContext = new AsyncLocalStorage();

// Cache for Prisma clients per database
const prismaInstances = new Map();

/**
 * Create or get cached Prisma client for a specific database
 * @param {string} dbName - Database name
 * @returns {PrismaClient} Prisma client instance
 */
function getPrismaClient(dbName) {
  // Validate dbName
  if (!dbName || typeof dbName !== "string") {
    throw new Error("Database name is required and must be a string");
  }

  // Return cached instance if exists
  if (prismaInstances.has(dbName)) {
    return prismaInstances.get(dbName);
  }

  // Get base DATABASE_URL from env
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Replace {{DB_NAME}} placeholder with actual database name
  let dynamicUrl = baseUrl.replace("{{DB_NAME}}", dbName);

  // If placeholder wasn't found, try to append database name (for SQL Server)
  if (dynamicUrl === baseUrl && baseUrl.includes("Initial Catalog")) {
    // SQL Server format: replace Initial Catalog value
    dynamicUrl = baseUrl.replace(
      /Initial Catalog=[^;]+/i,
      `Initial Catalog=${dbName}`
    );
  } else if (dynamicUrl === baseUrl) {
    // If still no replacement, log warning but continue
    console.warn(
      `Warning: DATABASE_URL does not contain {{DB_NAME}} placeholder. Using base URL.`
    );
  }

  // Create new Prisma client with dynamic database URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dynamicUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Cache the instance
  prismaInstances.set(dbName, prisma);

  return prisma;
}

/**
 * Set Prisma client in the current async context
 * Call this in middleware for each request
 */
function setPrisma(prisma) {
  prismaContext.enterWith({ prisma });
}

/**
 * Get Prisma client from the current async context
 * Use this anywhere in your code instead of passing prisma around
 */
function getPrisma() {
  const context = prismaContext.getStore();
  if (!context || !context.prisma) {
    throw new Error(
      "Prisma client not found in context. Make sure tenantMiddleware is applied to your route."
    );
  }
  return context.prisma;
}

/**
 * Disconnect all Prisma clients
 */
async function disconnectAll() {
  const disconnectPromises = Array.from(prismaInstances.values()).map(
    (client) => client.$disconnect()
  );
  await Promise.all(disconnectPromises);
  prismaInstances.clear();
}

module.exports = {
  getPrismaClient,
  setPrisma,
  getPrisma,
  disconnectAll,
};
