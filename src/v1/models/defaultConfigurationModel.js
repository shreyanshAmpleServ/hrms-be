const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize default configuration data
const serializeDefaultConfig = (data) => ({
  company_logo: data.company_logo || null,
  company_name: data.company_name || "",
  email: data.email || "",
  website: data.website || null,
  phone_number: data.phone_number || null,
  description: data.description || null,
  company_signature: data.company_signature || null,
  street_address: data.street_address || null,
  city: data.city || null,
  state: data.state ? Number(data.state) : null,
  province: data.province || null,
  zip_code: data.zip_code || null,
  country: data.country ? Number(data.country) : null,
  gst_number: data.gst_number || null,
  pan_number: data.pan_number || null,
  tax_id: data.tax_id || null,
  log_inst: data.log_inst || 1,
});

// Create a new default configuration
const createDefaultConfiguration = async (data) => {
  try {
    const reqData = await prisma.hrms_d_default_configurations.create({
      data: {
        ...serializeDefaultConfig(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
      },
      include: {
        default_configuration_state: {
          select: { id: true, name: true },
        },
        default_configuration_country: {
          select: { id: true, name: true },
        },
      },
    });
    return reqData;
  } catch (error) {
    console.log("Error creating default config", error);

    throw new CustomError(
      `Error creating default configuration: ${error.message}`,
      500
    );
  }
};

// Find a default configuration by ID
const findDefaultConfiguration = async (id) => {
  try {
    const reqData = await prisma.hrms_d_default_configurations.findUnique({
      where: { id: parseInt(id) },
      include: {
        default_configuration_state: {
          select: { id: true, name: true },
        },
        default_configuration_country: {
          select: { id: true, name: true },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("Default configuration not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding default configuration by ID: ${error.message}`,
      503
    );
  }
};

// Update a default configuration
const updateDefaultConfiguration = async (id, data) => {
  try {
    const payload = {
      ...serializeDefaultConfig(data),
      updatedby: Number(data.updatedby) || 1,
      updatedate: new Date(),
    };
    if (data.state === undefined) delete payload.state;
    if (data.country === undefined) delete payload.country;

    let result;
    if (id) {
      result = await prisma.hrms_d_default_configurations.update({
        where: { id: parseInt(id) },
        data: payload,
        include: {
          default_configuration_state: {
            select: { id: true, name: true },
          },
          default_configuration_country: {
            select: { id: true, name: true },
          },
        },
      });
    } else {
      // Create if id is not provided
      result = await prisma.hrms_d_default_configurations.create({
        data: {
          ...serializeDefaultConfig(data),
          createdby: Number(data.createdby) || 1,
          createdate: new Date(),
        },
        include: {
          default_configuration_state: {
            select: { id: true, name: true },
          },
          default_configuration_country: {
            select: { id: true, name: true },
          },
        },
      });
    }
    return result;
  } catch (error) {
    throw new CustomError(
      `Error updating/creating default configuration: ${error.message}`,
      500
    );
  }
};

// Delete a default configuration
const deleteDefaultConfiguration = async (id) => {
  try {
    await prisma.hrms_d_default_configurations.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting default configuration: ${error.message}`,
      500
    );
  }
};

// Get all default configurations (with optional search, pagination, date filter)
const getAllDefaultConfiguration = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

    if (search) {
      filterConditions.push({
        OR: [
          { company_name: { contains: search.toLowerCase() } },
          { email: { contains: search.toLowerCase() } },
          { website: { contains: search.toLowerCase() } },
          { phone_number: { contains: search.toLowerCase() } },
          { description: { contains: search.toLowerCase() } },
        ],
      });
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filterConditions.push({
          createdate: {
            gte: start,
            lte: end,
          },
        });
      }
    }

    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_d_default_configurations.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        default_configuration_state: {
          select: { id: true, name: true },
        },
        default_configuration_country: {
          select: { id: true, name: true },
        },
      },
    });

    const totalCount = await prisma.hrms_d_default_configurations.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving default configurations", 400);
  }
};

const updateDefaultConfigurationModel = async (id, data) => {
  try {
    const isUpdate = id && !isNaN(Number(id));
    const basePayload = serializeDefaultConfig(data);

    if (data.state === undefined) delete basePayload.state;
    if (data.country === undefined) delete basePayload.country;

    if (isUpdate) {
      const payload = {
        ...basePayload,
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      };

      return await prisma.hrms_d_default_configurations.update({
        where: { id: Number(id) },
        data: payload,
        include: {
          default_configuration_state: { select: { id: true, name: true } },
          default_configuration_country: { select: { id: true, name: true } },
        },
      });
    } else {
      const payload = {
        ...basePayload,
        createdby: data.createdby || 1,
        createdate: new Date(),
      };

      return await prisma.hrms_d_default_configurations.create({
        data: payload,
        include: {
          default_configuration_state: { select: { id: true, name: true } },
          default_configuration_country: { select: { id: true, name: true } },
        },
      });
    }
  } catch (error) {
    throw new CustomError(
      `Error in saving configuration: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createDefaultConfiguration,
  findDefaultConfiguration,
  updateDefaultConfiguration,
  getAllDefaultConfiguration,
  updateDefaultConfigurationModel,
  deleteDefaultConfiguration,
};
