const { prisma } = require("./prismaProxy.js");
const CustomError = require("./CustomError");

const checkDuplicate = async ({
  model,
  field,
  value,
  excludeId = null,
  errorMessage = null,
  caseInsensitive = true,
}) => {
  try {
    if (!value || !model || !field) {
      return true;
    }

    const trimmedValue = value.toString().trim();

    if (!trimmedValue) {
      return true;
    }

    const where = {};
    if (excludeId) {
      where.NOT = { id: parseInt(excludeId) };
    }

    const allRecords = await prisma[model].findMany({
      where,
      select: { id: true, [field]: true },
    });

    const duplicate = allRecords.find((record) => {
      const recordValue = record[field];
      if (!recordValue) return false;

      if (caseInsensitive) {
        return (
          recordValue.toString().toLowerCase() === trimmedValue.toLowerCase()
        );
      }
      return recordValue === trimmedValue;
    });

    if (duplicate) {
      const message =
        errorMessage || `${field.replace(/_/g, " ")} already exists`;
      throw new CustomError(message, 409);
    }

    return true;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    console.error("Duplicate check error:", error);
    throw new CustomError(`Error checking duplicate: ${error.message}`, 500);
  }
};

const checkMultipleDuplicates = async ({ model, fields, excludeId = null }) => {
  for (const { field, value, errorMessage } of fields) {
    await checkDuplicate({
      model,
      field,
      value,
      excludeId,
      errorMessage,
    });
  }
  return true;
};

module.exports = {
  checkDuplicate,
  checkMultipleDuplicates,
};
