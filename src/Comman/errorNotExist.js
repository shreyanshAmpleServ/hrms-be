const { prisma } = require("../utils/prismaProxy.js");
const CustomError = require("../utils/CustomError");

const errorNotExist = async (modelName, id, name) => {
  if (id === undefined || id === null || isNaN(Number(id))) {
    throw new CustomError(`Invalid or missing ID for ${name}`, 400);
  }

  const record = await prisma[modelName].findUnique({
    where: { id: Number(id) },
  });

  if (!record) {
    throw new CustomError(`${name} record with ID ${id} does not exist.`, 404);
  }

  return true;
};

module.exports = { errorNotExist };
