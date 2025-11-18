const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

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
  smtp_host: data.smtp_host || null,
  smtp_port: Number(data.smtp_port) || null,
  smtp_username: data.smtp_username || null,
  smtp_password: data.smtp_password || null,
  column_one: data.column_one || null,
  column_two: data.column_two || null,
  column_three: data.column_three || null,
  column_four: data.column_four || null,
  full_day_working_hours: Number(data.full_day_working_hours) || null,
  half_day_working_hours: Number(data.half_day_working_hours) || null,
  working_days: Number(data.working_days) || null,
  local_employee_probation_period: data.local_employee_probation_period || null,
  terms_and_conditions: data.terms_and_conditions || null,
  notes: data.notes || null,
  local_employee_notice_period:
    Number(data.local_employee_notice_period) || null,
  log_inst: data.log_inst || 1,
});

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

    const updatedConfig = await prisma.hrms_d_default_configurations.update({
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
    return updatedConfig;
  } catch (error) {
    throw new CustomError(
      `Error updating default configuration: ${error.message}`,
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

// Get all default configurations (with optional search, pagination, date filter)
const getAllDefaultConfiguration = async () => {
  try {
    const data = await prisma.hrms_d_default_configurations.findFirst({
      include: {
        default_configuration_state: {
          select: { id: true, name: true },
        },
        default_configuration_country: {
          select: { id: true, name: true },
        },
      },
    });
    return { data };
  } catch (error) {
    console.log("Error retrieving default configurations", error);
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
