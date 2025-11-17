const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

// Create a new contact stage
const createContactStage = async (data) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const contactStage = await prisma.ContactStages.create({
      data: {
        name: data.name,
        description: data.description || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });
    return contactStage;
  } catch (error) {
    throw new CustomError(
      `Error creating contact stage: ${error.message}`,
      500
    );
  }
};

// Find a contact stage by ID
const findContactStageById = async (id) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const contactStage = await prisma.ContactStages.findUnique({
      where: { id: parseInt(id) },
    });
    if (!contactStage) {
      throw new CustomError("Contact stage not found", 404);
    }
    return contactStage;
  } catch (error) {
    throw new CustomError(
      `Error finding contact stage by ID: ${error.message}`,
      503
    );
  }
};

// Update a contact stage
const updateContactStage = async (id, data) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const updatedContactStage = await prisma.ContactStages.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedContactStage;
  } catch (error) {
    throw new CustomError(
      `Error updating contact stage: ${error.message}`,
      500
    );
  }
};

// Delete a contact stage
const deleteContactStage = async (id) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    await prisma.ContactStages.delete({
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

// Get all contact stages
const getAllContactStages = async () => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const contactStages = await prisma.ContactStages.findMany({
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    return contactStages;
  } catch (error) {
    throw new CustomError("Error retrieving contact stages", 503);
  }
};

module.exports = {
  createContactStage,
  findContactStageById,
  updateContactStage,
  deleteContactStage,
  getAllContactStages,
};
