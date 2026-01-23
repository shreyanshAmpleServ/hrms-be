const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError.js");
const { includes } = require("zod/v4");

const normalizeConfigData = (data) => ({
  ...data,
  loan_pay_componet_id: data.loan_pay_componet_id
    ? Number(data.loan_pay_componet_id)
    : null,
  advance_pay_componet_id: data.advance_pay_componet_id
    ? Number(data.advance_pay_componet_id)
    : null,
  nssf_pay_componet_id: data.nssf_pay_componet_id
    ? Number(data.nssf_pay_componet_id)
    : null,

  nssf_percent: data.nssf_percent ? data.nssf_percent : "0",
  fix_nssf_amount: data.fix_nssf_amount ? data.fix_nssf_amount : "0",
  max_advance_amount: data.max_advance_amount ? data.max_advance_amount : "0",

  is_tax_payee_from_formula: data.is_tax_payee_from_formula || "N",
  is_multiple_calculation: data.is_multiple_calculation || "N",
  is_enable_branch: data.is_enable_branch || "N",
  is_yearly_required: data.is_yearly_required || "N",
});

// Create a new payRollSettings
const createPayRollConfigSetting = async (data) => {
  try {
    const normalized = normalizeConfigData(data);

    const payRollSettings =
      await prisma.hrms_m_payroll_confuguration_setting.create({
        data: {
          ...normalized,
          createdby: data.createdby || 1,
          createdate: new Date(),
          updatedate: new Date(),
          log_inst: data.log_inst || 1,
        },
        include: {
          payroll_config_loan_pay_component: true,
          payroll_config_advanc_pay_component: true,
          payroll_config_nssf_pay_component: true,
        },
      });

    return payRollSettings;
  } catch (error) {
    throw new CustomError(
      `Error creating payroll configuration: ${error.message}`,
      500
    );
  }
};

// Find a payRollSettings by ID
const findPayRollConfigSettingById = async (id) => {
  try {
    const payRollSettings =
      await prisma.hrms_m_payroll_confuguration_setting.findUnique({
        where: { id: parseInt(id) },
        include: {
          payroll_config_loan_pay_component: true,
          payroll_config_advanc_pay_component: true,
          payroll_config_nssf_pay_component: true,
        },
      });
    // if (!payRollSettings) {
    //   throw new CustomError("Pay not found", 404);
    // }
    return payRollSettings;
  } catch (error) {
    throw new CustomError(
      `Error finding PayRoll Settings by ID: ${error.message}`,
      503
    );
  }
};

// Update a payRollSettings
const updatePayRollConfigSetting = async (id, data) => {
  try {
    const normalized = normalizeConfigData(data);

    const updatedpayRollSettings =
      await prisma.hrms_m_payroll_confuguration_setting.update({
        where: { id: parseInt(id) },
        data: {
          ...normalized,
          updatedate: new Date(),
        },
        include: {
          payroll_config_loan_pay_component: true,
          payroll_config_advanc_pay_component: true,
          payroll_config_nssf_pay_component: true,
        },
      });

    return updatedpayRollSettings;
  } catch (error) {
    throw new CustomError(
      `Error updating payroll configuration: ${error.message}`,
      500
    );
  }
};

// Delete a payRollSettings
const deletePayRollConfigSetting = async (id) => {
  try {
    await prisma.hrms_m_payroll_confuguration_setting.delete({
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

// Get all payRollSettings
const getAllPayRollConfigSetting = async (
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

    const payRollSettings =
      await prisma.hrms_m_payroll_confuguration_setting.findMany({
        where: filters,
        skip: skip,
        take: size,
        includes: {
          payroll_config_loan_pay_component: true,
          payroll_config_advanc_pay_component: true,
          payroll_config_nssf_pay_component: true,
        },
        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

    const totalCount = await prisma.hrms_m_payroll_confuguration_setting.count({
      where: filters,
    });
    return {
      data: payRollSettings,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving PayRoll Settings", 503);
  }
};

module.exports = {
  createPayRollConfigSetting,
  findPayRollConfigSettingById,
  updatePayRollConfigSetting,
  deletePayRollConfigSetting,
  getAllPayRollConfigSetting,
};
