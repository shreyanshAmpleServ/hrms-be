const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createPF = async (data) => {
  try {
    const finalData = await prisma.hrms_m_provident_fund.create({
      data: {
        pf_name: data.pf_name,
        employer_contribution: data.employer_contribution,
        employee_contribution: data.employee_contribution,
        is_active: data.is_active || "Y",

        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,

        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create PF ", error);
    throw new CustomError(`Error creating PF: ${error.message}`, 500);
  }
};

const findPFById = async (id) => {
  try {
    const data = await prisma.hrms_m_provident_fund.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("PF not found", 404);
    }
    return data;
  } catch (error) {
    console.log("PF By Id  ", error);
    throw new CustomError(`Error finding PF by ID: ${error.message}`, 503);
  }
};

const updatePF = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_provident_fund.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating PF: ${error.message}`, 500);
  }
};

const deletePF = async (id) => {
  try {
    await prisma.hrms_m_provident_fund.delete({
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

// Get all PF
const getAllPF = async (page, size, search, startDate, endDate, is_active) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          pf_name: { contains: search.toLowerCase() },
        },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    const data = await prisma.hrms_m_provident_fund.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_provident_fund.count({
      where: filters,
    });
    return {
      data: data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving PF", 503);
  }
};

module.exports = {
  createPF,
  findPFById,
  updatePF,
  deletePF,
  getAllPF,
};
