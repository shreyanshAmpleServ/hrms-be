export const errorNotExist = async (modelName, id) => {
  const record = await prisma[modelName].findUnique({
    where: { id: Number(id) },
  });

  if (!record) {
    throw new Error(`${modelName} record with ID ${id} does not exist.`);
  }

  return true;
};