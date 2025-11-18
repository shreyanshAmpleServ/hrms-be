const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Create a new call type
const createCallType = async (data) => {
  try {
    const callType = await prisma.crms_m_calltype.create({
      data: {
        name: data.name,
        description: data.description || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });
    return callType;
  } catch (error) {
    throw new CustomError(`Error creating call type: ${error.message}`, 500);
  }
};

// Find a call type by ID
const findCallTypeById = async (id) => {
  try {
    const callType = await prisma.crms_m_calltype.findUnique({
      where: { id: parseInt(id) },
    });
    if (!callType) {
      throw new CustomError("Call type not found", 404);
    }
    return callType;
  } catch (error) {
    throw new CustomError(
      `Error finding call type by ID: ${error.message}`,
      503
    );
  }
};

// Update a call type
const updateCallType = async (id, data) => {
  try {
    const updatedCallType = await prisma.crms_m_calltype.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedCallType;
  } catch (error) {
    throw new CustomError(`Error updating call type: ${error.message}`, 500);
  }
};

// Delete a call type
const deleteCallType = async (id) => {
  try {
    await prisma.crms_m_calltype.delete({
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

// Get all call types
const getAllCallTypes = async () => {
  try {
    const callTypes = await prisma.crms_m_calltype.findMany({
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    return callTypes;
  } catch (error) {
    throw new CustomError("Error retrieving call types", 503);
  }
};

module.exports = {
  createCallType,
  findCallTypeById,
  updateCallType,
  deleteCallType,
  getAllCallTypes,
};
