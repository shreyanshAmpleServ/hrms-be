const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../utils/CustomError"); // make sure path is correct

const errorNotExist = async (modelName, id, name) => {
  // Validate ID
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
