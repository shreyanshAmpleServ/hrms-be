const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const checkDuplicateCountry = async (name, code, id = null) => {
  const conditions = [];

  if (name) {
    conditions.push({
      name: name,
    });
  }

  if (code) {
    conditions.push({
      code: code,
    });
  }

  const duplicate = await prisma.hrms_m_country_master.findFirst({
    where: {
      OR: conditions,
      ...(id && { id: { not: id } }),
    },
  });

  return duplicate;
};

const createCountry = async (data) => {
  try {
    const duplicate = await checkDuplicateCountry(data.name, data.code);
    if (duplicate) {
      throw new CustomError("Country already exists", 400);
    }
    const country = await prisma.hrms_m_country_master.create({
      data: {
        ...data,
        name: data.name,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return country;
  } catch (error) {
    console.log("Create Country ", error);
    throw new CustomError(`${error.message}`, 500);
  }
};

const findCountryById = async (id) => {
  try {
    const country = await prisma.hrms_m_country_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!country) {
      throw new CustomError("Country not found", 404);
    }
    return country;
  } catch (error) {
    console.log("Country By Id  ", error);
    throw new CustomError(`${error.message}`, 503);
  }
};

const updateCountry = async (id, data) => {
  try {
    const duplicate = await checkDuplicateCountry(data.name, data.code, id);
    if (duplicate) {
      throw new CustomError("Country already exists", 400);
    }
    const updatedCountry = await prisma.hrms_m_country_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedCountry;
  } catch (error) {
    throw new CustomError(`${error.message}`, 500);
  }
};

const deleteCountry = async (id) => {
  try {
    await prisma.hrms_m_country_master.delete({
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

const getAllCountries = async (is_active) => {
  try {
    const filters = {};

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const countries = await prisma.hrms_m_country_master.findMany({
      where: filters,
      orderBy: [{ createdate: "desc" }],
    });

    return countries;
  } catch (error) {
    console.error("Country error: ", error);
    throw new CustomError(`${error.message}`, 503);
  }
};

module.exports = {
  createCountry,
  findCountryById,
  updateCountry,
  deleteCountry,
  getAllCountries,
};
