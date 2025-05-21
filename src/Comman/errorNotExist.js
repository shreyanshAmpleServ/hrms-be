import { PrismaClient } from "@prisma/client";

// const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export const errorNotExist = async (modelName, id , name) => {
  const record = await prisma[modelName].findUnique({
    where: { id: Number(id) },
  });

  if (!record) {
    throw new Error(`${name} record with ID ${id} does not exist.`);
  }

  return true;
};
