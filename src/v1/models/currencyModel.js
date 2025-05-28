const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createCurrency = async (data) => {
  try {
    const currency = await prisma.hrms_m_currency_master.create({
      data: {
        currency_name: data.currency_name,
        currency_code: data.currency_code || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });
    return currency;
  } catch (error) {
    throw new CustomError(`Error creating currency: ${error.message}`, 500);
  }
};

const findCurrencyById = async (id) => {
  try {
    const currency = await prisma.hrms_m_currency_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!currency) {
      throw new CustomError("Currency not found", 404);
    }
    return currency;
  } catch (error) {
    throw new CustomError(
      `Error finding currency by ID: ${error.message}`,
      503
    );
  }
};

const updateCurrency = async (id, data) => {
  try {
    const updatedCurrency = await prisma.hrms_m_currency_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedCurrency;
  } catch (error) {
    throw new CustomError(`Error updating currency: ${error.message}`, 500);
  }
};

const deleteCurrency = async (id) => {
  try {
    await prisma.hrms_m_currency_master.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting currency: ${error.message}`, 500);
  }
};

const getAllCurrency = async (page, size, search) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    let filters = {};

    if (search) {
      filters.OR = [
        { currency_name: { contains: search.toLowerCase() } },
        { currency_code: { contains: search.toLowerCase() } },
      ];
    }

    const Currencies = await prisma.hrms_m_currency_master.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_currency_master.count({
      where: filters,
    });
    return {
      data: Currencies,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving Currency", 503);
  }
};

module.exports = {
  createCurrency,
  findCurrencyById,
  updateCurrency,
  deleteCurrency,
  getAllCurrency,
};
