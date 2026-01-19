// const { prisma } = require("../../utils/prismaProxy.js");

// const prismaInstances = new Map();

// function getPrismaClient(dbName) {
//   if (prismaInstances.has(dbName)) {
//     return prismaInstances.get(dbName);
//   }
//   const baseUrl = process.env.DATABASE_URL;
//   const urlParts = baseUrl.match(
//     /sqlserver:\/\/([^:]+):(\d+);initial catalog=([^;]+);user=([^;]+);password=([^;]+);(.*)$/
//   );

//   if (!urlParts) {
//     throw new Error("Invalid DATABASE_URL format");
//   }

//   const [, server, port, , user, password, options] = urlParts;

//   const clientDbUrl = `sqlserver://${server}:${port};initial catalog=${dbName};user=${user};password=${password};${options}`;

//   const prisma = new PrismaClient({
//     datasources: {
//       db: {
//         url: clientDbUrl,
//       },
//     },
//   });

//   prismaInstances.set(dbName, prisma);

//   return prisma;
// }

// async function disconnectClient(dbName) {
//   const client = prismaInstances.get(dbName);
//   if (client) {
//     await client.$disconnect();
//     prismaInstances.delete(dbName);
//   }
// }

// async function disconnectAll() {
//   const disconnectPromises = Array.from(prismaInstances.values()).map(
//     (client) => client.$disconnect()
//   );
//   await Promise.all(disconnectPromises);
//   prismaInstances.clear();
//   prismaInstances.clear();
// }

// module.exports = {
//   getPrismaClient,
//   disconnectClient,
//   disconnectAll,
// };

const { PrismaClient } = require("@prisma/client");
const logger = require("../Comman/logger");

const prismaInstances = new Map();
function getPrismaClient(dbName) {
  if (prismaInstances.has(dbName)) {
    return prismaInstances.get(dbName);
  }

  logger.info(`Creating Prisma client for: ${dbName}`);

  const baseUrl = process.env.DATABASE_URL;
  const regex =
    /sqlserver:\/\/([^:]+):(\d+);initial catalog=([^;]+);user=([^;]+);password=([^;]+);(.*)$/;
  const urlParts = baseUrl.match(regex);

  if (!urlParts) {
    throw new Error("Invalid DATABASE_URL format");
  }
  const [, server, port, , user, password, options] = urlParts;
  const clientDbUrl = `sqlserver://${server}:${port};initial catalog=${dbName};user=${user};password=${password};${options}`;
  const prisma = new PrismaClient({
    datasources: { db: { url: clientDbUrl } },
  });

  prismaInstances.set(dbName, prisma);

  return prisma;
}

// async function getPrismaClient(dbName) {
//   if (!dbName) {
//     throw new Error("Database name is required");
//   }
//   if (prismaInstances.has(dbName)) {
//     return prismaInstances.get(dbName);
//   }

//   logger.info(`Creating Prisma client for: ${dbName}`);

//   const baseUrl = process.env.DATABASE_URL;
//   const regex =
//     /sqlserver:\/\/([^:]+):(\d+);initial catalog=([^;]+);user=([^;]+);password=([^;]+);(.*)$/;
//   const urlParts = baseUrl.match(regex);

//   if (!urlParts) {
//     throw new Error("Invalid DATABASE_URL format");
//   }

//   const [, server, port, , user, password, options] = urlParts;
//   const clientDbUrl = `sqlserver://${server}:${port};initial catalog=${dbName};user=${user};password=${password};${options}`;
//   const prisma = new PrismaClient({
//     datasources: { db: { url: clientDbUrl } },
//   });

//   prismaInstances.set(dbName, prisma);

//   console.log(`Prisma client created for database: ${dbName}`, clientDbUrl);

//   return prisma;
// }

async function disconnectAll() {
  const promises = Array.from(prismaInstances.values()).map((c) =>
    c.$disconnect()
  );
  await Promise.all(promises);
  prismaInstances.clear();
}

module.exports = { getPrismaClient, disconnectAll };
