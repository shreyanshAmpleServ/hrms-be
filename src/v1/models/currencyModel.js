const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const mockCurrencies = require("../../mock/currency.mock.js");

const createCurrency = async (data) => {
  try {
    const existingName = await prisma.hrms_m_currency_master.findFirst({
      where: {
        currency_name: { equals: data.currency_name },
      },
    });

    if (existingName) {
      throw new CustomError("Currency name already exists", 400);
    }

    if (data.currency_code) {
      const existingCode = await prisma.hrms_m_currency_master.findFirst({
        where: {
          currency_code: { equals: data.currency_code, mode: "insensitive" },
        },
      });

      if (existingCode) {
        throw new CustomError("Currency code already exists", 400);
      }
    }

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
    throw new CustomError(` ${error.message}`, 500);
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
    const numericId = parseInt(id);

    if (data.currency_name) {
      const existingName = await prisma.hrms_m_currency_master.findFirst({
        where: {
          currency_name: { equals: data.currency_name },
          NOT: { id: numericId },
        },
      });

      if (existingName) {
        throw new CustomError("Currency name already exists", 400);
      }
    }

    if (data.currency_code) {
      const existingCode = await prisma.hrms_m_currency_master.findFirst({
        where: {
          currency_code: { equals: data.currency_code },
          NOT: { id: numericId },
        },
      });

      if (existingCode) {
        throw new CustomError("Currency code already exists", 400);
      }
    }

    const updatedCurrency = await prisma.hrms_m_currency_master.update({
      where: { id: numericId },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });

    return updatedCurrency;
  } catch (error) {
    throw new CustomError(`${error.message}`, 500);
  }
};

const deleteCurrency = async (id) => {
  try {
    await prisma.hrms_m_currency_master.delete({
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

const getAllCurrency = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  try {
    const totalCountCheck = await prisma.hrms_m_currency_master.count();
    if (totalCountCheck === 0) {
      for (const currencyData of mockCurrencies) {
        await prisma.hrms_m_currency_master.create({
          data: {
            currency_name: currencyData.currency_name,
            currency_code: currencyData.currency_code || null,
            is_active: currencyData.is_active || "Y",
            log_inst: currencyData.log_inst || 1,
            createdby: 1,
          },
        });
      }
    }

    page = page && page !== 0 ? parseInt(page) : 1;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    let filters = {};

    if (search) {
      filters.OR = [
        { currency_name: { contains: search.toLowerCase() } },
        { currency_code: { contains: search.toLowerCase() } },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
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
