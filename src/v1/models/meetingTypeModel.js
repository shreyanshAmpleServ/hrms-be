const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

// Create a new meeting type
const createMeetingType = async (data) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const meetingType = await prisma.crms_m_meetingtype.create({
      data: {
        name: data.name,
        description: data.description || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });
    return meetingType;
  } catch (error) {
    throw new CustomError(`Error creating meeting type: ${error.message}`, 500);
  }
};

// Find a meeting type by ID
const findMeetingTypeById = async (id) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const meetingType = await prisma.crms_m_meetingtype.findUnique({
      where: { id: parseInt(id) },
    });
    if (!meetingType) {
      throw new CustomError("Meeting type not found", 404);
    }
    return meetingType;
  } catch (error) {
    throw new CustomError(
      `Error finding meeting type by ID: ${error.message}`,
      503
    );
  }
};

// Update a meeting type
const updateMeetingType = async (id, data) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const updatedMeetingType = await prisma.crms_m_meetingtype.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedMeetingType;
  } catch (error) {
    throw new CustomError(`Error updating meeting type: ${error.message}`, 500);
  }
};

// Delete a meeting type
const deleteMeetingType = async (id) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    await prisma.crms_m_meetingtype.delete({
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

// Get all meeting types
const getAllMeetingTypes = async () => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const meetingTypes = await prisma.crms_m_meetingtype.findMany({
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    return meetingTypes;
  } catch (error) {
    throw new CustomError("Error retrieving meeting types", 503);
  }
};

module.exports = {
  createMeetingType,
  findMeetingTypeById,
  updateMeetingType,
  deleteMeetingType,
  getAllMeetingTypes,
};
