const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Create a new call status
const createCallStatus = async (data) => {
  try {
    const callStatus = await prisma.CallStatuses.create({
      data: {
        name: data.name,
        description: data.description || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });
    return callStatus;
  } catch (error) {
    throw new CustomError(`Error creating call status: ${error.message}`, 500);
  }
};

// Find a call status by ID
const findCallStatusById = async (id) => {
  try {
    const callStatus = await prisma.CallStatuses.findUnique({
      where: { id: parseInt(id) },
    });
    if (!callStatus) {
      throw new CustomError("Call status not found", 404);
    }
    return callStatus;
  } catch (error) {
    throw new CustomError(
      `Error finding call status by ID: ${error.message}`,
      503
    );
  }
};

// Update a call status
const updateCallStatus = async (id, data) => {
  try {
    const updatedCallStatus = await prisma.CallStatuses.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedCallStatus;
  } catch (error) {
    throw new CustomError(`Error updating call status: ${error.message}`, 500);
  }
};

// Delete a call status
const deleteCallStatus = async (id) => {
  try {
    await prisma.CallStatuses.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

// Get all call statuses
const getAllCallStatuses = async () => {
  try {
    const callStatuses = await prisma.CallStatuses.findMany({
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    return callStatuses;
  } catch (error) {
    throw new CustomError("Error retrieving call statuses", 503);
  }
};

module.exports = {
  createCallStatus,
  findCallStatusById,
  updateCallStatus,
  deleteCallStatus,
  getAllCallStatuses,
};
