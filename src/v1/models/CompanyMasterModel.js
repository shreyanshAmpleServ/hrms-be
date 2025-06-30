const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Create a new company
const createCompany = async (data) => {
  try {
    const company = await prisma.hrms_m_company_master.create({
      data: {
        ...data,
        country_id: Number(data.country_id),
        createdby: data.createdby || 1,
        createdate: new Date(),
        updatedate: new Date(),
        is_active: data.is_active || "Y",

        log_inst: data.log_inst || 1,
      },
    });
    return company;
  } catch (error) {
    throw new CustomError(`Error creating company: ${error.message}`, 500);
  }
};

// Find a company by ID
const findCompanyById = async (id) => {
  try {
    const company = await prisma.hrms_m_company_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!company) {
      throw new CustomError("company not found", 404);
    }
    return company;
  } catch (error) {
    throw new CustomError(`Error finding company by ID: ${error.message}`, 503);
  }
};

// Update a company
const updateCompany = async (id, data) => {
  try {
    const updatedcompany = await prisma.hrms_m_company_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        country_id: Number(data.country_id),
        is_active: data.is_active || "Y",
        updatedate: new Date(),
      },
    });
    return updatedcompany;
  } catch (error) {
    throw new CustomError(`Error updating company: ${error.message}`, 500);
  }
};

// Delete a company
const deleteCompany = async (id) => {
  try {
    await prisma.hrms_m_company_master.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting company: ${error.message}`, 500);
  }
};

// Get all companies
const getAllCompanies = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        { company_name: { contains: search.toLowerCase() } },
        { company_code: { contains: search.toLowerCase() } },
        { contact_person: { contains: search.toLowerCase() } },
        { contact_phone: { contains: search.toLowerCase() } },
        { contact_email: { contains: search.toLowerCase() } },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = {
          gte: start,
          lte: end,
        };
      }
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const departments = await prisma.hrms_m_company_master.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_company_master.count({
      where: filters,
    });
    return {
      data: departments,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving companies", 503);
  }
};

module.exports = {
  createCompany,
  findCompanyById,
  updateCompany,
  deleteCompany,
  getAllCompanies,
};
