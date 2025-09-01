const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Create a new lead
const createLead = async (data) => {
  try {
    const lead = await prisma.crms_leads.create({
      data: {
        ...data,
        is_active: data.is_active || "Y",
        email_opt_out: data.email_opt_out || "N",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });
    return lead;
  } catch (error) {
    throw new CustomError(`Error creating lead: ${error.message}`, 500);
  }
};

// Find a lead by ID
const findLeadById = async (id) => {
  try {
    const lead = await prisma.crms_leads.findUnique({
      where: { id: parseInt(id) },
    });
    if (!lead) {
      throw new CustomError("Lead not found", 404);
    }
    return lead;
  } catch (error) {
    throw new CustomError(`Error finding lead by ID: ${error.message}`, 503);
  }
};

// Update a lead
const updateLead = async (id, data) => {
  try {
    const updatedLead = await prisma.crms_leads.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
        is_active: data.is_active || "Y",
      },
    });
    return updatedLead;
  } catch (error) {
    throw new CustomError(`Error updating lead: ${error.message}`, 500);
  }
};

// Delete a lead
const deleteLead = async (id) => {
  try {
    await prisma.crms_leads.delete({
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

// Get all leads
const getAllLeads = async () => {
  try {
    const leads = await prisma.crms_leads.findMany({
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    return leads;
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving leads", 503);
  }
};

module.exports = {
  createLead,
  findLeadById,
  updateLead,
  deleteLead,
  getAllLeads,
};
