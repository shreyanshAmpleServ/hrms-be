// const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
//

// Create a new bank
const createBank = async (prisma, data) => {
  try {
    console.log("data", data);
    const bank = await prisma.hrms_m_bank_master.create({
      data: {
        bank_name: data.bank_name,
        // description: data.description || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });
    return bank;
  } catch (error) {
    console.log("Bank Creation : ", error);
    throw new CustomError(`Error creating bank: ${error.message}`, 500);
  }
};

// Find an bank by ID
const findBankById = async (prisma, id) => {
  try {
    const bank = await prisma.hrms_m_bank_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!bank) {
      throw new CustomError("bank not found", 404);
    }
    return bank;
  } catch (error) {
    throw new CustomError(`Error finding bank by ID: ${error.message}`, 503);
  }
};

// Update an bank
const updateBank = async (prisma, id, data) => {
  try {
    const updatedbank = await prisma.hrms_m_bank_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedbank;
  } catch (error) {
    throw new CustomError(`Error updating bank: ${error.message}`, 500);
  }
};

// Delete an bank
const deleteBank = async (prisma, id) => {
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
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

// Get all industries
// const getAllBank = async (search,page,size) => {
//     try {
//         page = (!page || (page == 0)) ?  1 : page ;
//         size = size || 10;
//         const skip = (page - 1) * size || 0;

//         const filters = {};
//         if (search) {
//           filters.bank_name = { contains: search.toLowerCase() }
//         }
//         const banks = await prisma.hrms_m_bank_master.findMany({
//             where: filters,
//             skip: skip,
//             take: size,
//             orderBy: [
//                 { updatedate: 'desc' },
//                 { createdate: 'desc' },
//             ],
//         });
//         const totalCount = await prisma.hrms_m_bank_master.count({
//             where: filters,
//         });
//         return {
//             data: banks,
//             currentPage: page,
//             size,
//             totalPages: Math.ceil(totalCount / size),
//             totalCount : totalCount  ,
//           };
//     } catch (error) {
//         throw new CustomError('Error retrieving banks', 503);
//     }
// };

const getAllBank = async (search, page, size, is_active) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};

    if (search) {
      filters.bank_name = { contains: search.toLowerCase() };
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
