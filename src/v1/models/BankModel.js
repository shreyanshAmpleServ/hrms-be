const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const mockBanks = require("../../mock/bank.mock.js");

// Create a new bank
const createBank = async (data) => {
  try {
    console.log("Creating bank with data:", data);
    if (!data.bank_name || data.bank_name.trim() === "") {
      throw new CustomError("Bank name is required", 400);
    }

    const bank = await prisma.hrms_m_bank_master.create({
      data: {
        bank_name: data.bank_name,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
      },
    });
    return bank;
  } catch (error) {
    console.error("Bank Creation Error:", error);
    throw new CustomError(`Error creating bank: ${error.message}`, 500);
  }
};

// Find a bank by ID
const findBankById = async (id) => {
  try {
    const bank = await prisma.hrms_m_bank_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!bank) {
      throw new CustomError("Bank not found", 404);
    }
    return bank;
  } catch (error) {
    throw new CustomError(`Error finding bank by ID: ${error.message}`, 503);
  }
};

// Update a bank
const updateBank = async (id, data) => {
  try {
    const updatedBank = await prisma.hrms_m_bank_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedBank;
  } catch (error) {
    console.error("Bank Update Error:", error);
    throw new CustomError(`Error updating bank: ${error.message}`, 500);
  }
};

// Delete a bank
const deleteBank = async (id) => {
  try {
    await prisma.hrms_m_bank_master.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(
        error.meta?.constraint || "Error deleting bank",
        500
      );
    }
  }
};

const getAllBank = async (search, page, size, is_active) => {
  try {
    const totalCountCheck = await prisma.hrms_m_bank_master.count();
    if (totalCountCheck === 0) {
      for (const bankData of mockBanks) {
        await prisma.hrms_m_bank_master.create({
          data: {
            bank_name: bankData.bank_name,
            is_active: bankData.is_active || "Y",
            log_inst: bankData.log_inst || 1,
            createdby: 1,
            createdate: new Date(),
          },
        });
      }
    }

    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};

    if (search && typeof search === "string" && search.trim() !== "") {
      filters.OR = [
        {
          bank_name: { contains: search.toLowerCase() },
        },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const banks = await prisma.hrms_m_bank_master.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_bank_master.count({
      where: filters,
    });

    return {
      data: banks,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.error("Get All Banks Error:", error);
    throw new CustomError("Error retrieving banks", 503);
  }
};
module.exports = {
  createBank,
  findBankById,
  updateBank,
  deleteBank,
  getAllBank,
};
