const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Create a new lost reason
const createLostReason = async (data) => {
  try {
    const lostReason = await prisma.LostReasons.create({
      data: {
        name: data.name,
        order: data.order || null,
        description: data.description || null,
        colorCode: data.colorCode || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });
    return lostReason;
  } catch (error) {
    throw new CustomError(`Error creating lost reason: ${error.message}`, 500);
  }
};

// Find a lost reason by ID
const findLostReasonById = async (id) => {
  try {
    const lostReason = await prisma.LostReasons.findUnique({
      where: { id: parseInt(id) },
    });
    if (!lostReason) {
      throw new CustomError("Lost reason not found", 404);
    }
    return lostReason;
  } catch (error) {
    throw new CustomError(
      `Error finding lost reason by ID: ${error.message}`,
      503
    );
  }
};

// Update a lost reason
const updateLostReason = async (id, data) => {
  try {
    const updatedLostReason = await prisma.LostReasons.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedLostReason;
  } catch (error) {
    throw new CustomError(`Error updating lost reason: ${error.message}`, 500);
  }
};

// Delete a lost reason
const deleteLostReason = async (id) => {
  try {
    await prisma.LostReasons.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record cannot be deleted because it has associated data other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

// Get all lost reasons
const getAllLostReasons = async () => {
  try {
    const lostReasons = await prisma.LostReasons.findMany({
      orderBy: [
        { order: "asc" },
        { updatedate: "desc" },
        { createdate: "desc" },
      ],
    });
    return lostReasons;
  } catch (error) {
    throw new CustomError("Error retrieving lost reasons", 503);
  }
};

module.exports = {
  createLostReason,
  findLostReasonById,
  updateLostReason,
  deleteLostReason,
  getAllLostReasons,
};
