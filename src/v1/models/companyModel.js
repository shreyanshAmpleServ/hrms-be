const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize/parse logic for any complex fields (if needed in the future)
const serializeData = (data) => {
  // Add serialization logic here if required
  return data;
};

const parseData = (company) => {
  // Add parsing logic here if required
  return company;
};

const createCompany = async (data) => {
  try {
    const existingCompany = await prisma.Company.findFirst({
      where: {
        OR: [
          { primaryContactEmail: data.primaryContactEmail },
          { email: data.email },
        ],
      },
    });
    if (existingCompany) {
      throw new CustomError(
        "Email or Primary contact Email is not unique",
        400
      );
    }

    const company = await prisma.Company.create({ data });
    return parseData(company);
  } catch (error) {
    throw new CustomError(`Error creating company: ${error.message}`, 500);
  }
};

const findCompanyById = async (id) => {
  try {
    const company = await prisma.Company.findUnique({
      where: { id: parseInt(id) },
    });
    return parseData(company);
  } catch (error) {
    throw new CustomError("Error finding company by ID", 503);
  }
};

const findCompanyByEmail = async (email) => {
  try {
    const company = await prisma.Company.findFirst({
      where: { email },
    });
    return parseData(company);
  } catch (error) {
    throw new CustomError("Error finding company by email", 503);
  }
};

const updateCompany = async (id, data) => {
  try {
    const updatedData = {
      ...data,
      updatedDate: new Date(),
    };
    const serializedData = serializeData(updatedData);
    const company = await prisma.Company.update({
      where: { id: parseInt(id) },
      data: serializedData,
    });
    return parseData(company);
  } catch (error) {
    throw new CustomError(`Error updating company: ${error.message}`, 500);
  }
};

const deleteCompany = async (id) => {
  try {
    await prisma.Company.delete({
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

const getAllCompanies = async (page, size, search, startDate, endDate) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          email: { contains: search.toLowerCase() },
        },
        {
          name: { contains: search.toLowerCase() },
        },
        {
          phone: { contains: search.toLowerCase() },
        },
        {
          website: { contains: search.toLowerCase() },
        },
        {
          industryType: { contains: search.toLowerCase() },
        },
        {
          businessType: { contains: search.toLowerCase() },
        },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdDate = {
          gte: start,
          lte: end,
        };
      }
    }

    const companies = await prisma.Company.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [
        { updatedDate: "desc" }, // Sort by updatedDate in descending order
        { createdDate: "desc" }, // Then sort by createdDate in descending order
      ],
    });
    const totalCount = await prisma.Company.count();

    return {
      data: companies,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
    // return companies.map(parseData);
  } catch (error) {
    console.log("Error get Companies modal : ", error);
    throw new CustomError("Error retrieving companies", 503);
  }
};

module.exports = {
  createCompany,
  findCompanyById,
  findCompanyByEmail,
  updateCompany,
  deleteCompany,
  getAllCompanies,
};
