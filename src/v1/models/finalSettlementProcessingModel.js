const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serializer
const serializeSettlementData = (data) => ({
  employee_id: Number(data.employee_id),
  payroll_month: Number(data.payroll_month),
  payroll_year: Number(data.payroll_year),
  overtime_date: new Date(data.overtime_date),
  pay_currency: data.pay_currency,
  component_id: Number(data.component_id),
  start_date: new Date(data.start_date),
  end_date: new Date(data.end_date),
  no_of_days: data.no_of_days ? Number(data.no_of_days) : null,
  no_of_days_entitled: data.no_of_days_entitled
    ? Number(data.no_of_days_entitled)
    : null,
  basic_pay: data.basic_pay,
  annual_basic_pay: data.annual_basic_pay,
  leave_pay: data.leave_pay,
  no_of_working_days: data.no_of_working_days
    ? Number(data.no_of_working_days)
    : null,
  no_of_working_years: data.no_of_working_years
    ? Number(data.no_of_working_years)
    : null,
  total_payment: data.total_payment || null,
  entitled_after5yrs: data.entitled_after5yrs || null,
  esob_after5yrs: data.esob_after5yrs || null,
  esob: data.esob || null,
  je_transid: data.je_transid || null,
  status: data.status || "Pending",
  execution_date: data.execution_date ? new Date(data.execution_date) : null,
  pay_date: data.pay_date ? new Date(data.pay_date) : null,
  pay_id: data.pay_id || null,
  processed: data.processed || "N",
  approved1: data.approved1 || "N",
  approver1_id: data.approver1_id || null,
  employee_email: data.employee_email || null,
  remarks: data.remarks || null,
});

//  Create
const createFinalSettlementProcessing = async (data) => {
  try {
    const result = await prisma.hrms_d_finalsettlement_processing.create({
      data: {
        ...serializeSettlementData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        final_settlement_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
        finalsettlement_component: {
          select: { id: true, component_name: true, component_code: true },
        },
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error creating final settlement: ${error.message}`,
      500
    );
  }
};

//  Get All
const getAllFinalSettlements = async (search, page = 1, size = 10) => {
  try {
    const skip = (page - 1) * size;
    const filters = {};

    if (search) {
      filters.OR = [
        { employee_email: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
      ];
    }

    const data = await prisma.hrms_d_finalsettlement_processing.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: { createdate: "desc" },
      include: {
        hrms_d_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
        hrms_m_pay_component: {
          select: { id: true, component_name: true, component_code: true },
        },
      },
    });

    const totalCount = await prisma.hrms_d_finalsettlement_processing.count({
      where: filters,
    });

    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError(`Error fetching settlements: ${error.message}`, 500);
  }
};

// Get By ID
const getFinalSettlementById = async (id) => {
  try {
    const result = await prisma.hrms_d_finalsettlement_processing.findUnique({
      where: { id: parseInt(id) },
      include: {
        hrms_d_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
        hrms_m_pay_component: {
          select: { id: true, component_name: true, component_code: true },
        },
      },
    });
    if (!result) throw new CustomError("Final settlement not found", 404);
    return result;
  } catch (error) {
    throw new CustomError(`Error fetching record: ${error.message}`, 500);
  }
};

// Update
const updateFinalSettlement = async (id, data) => {
  try {
    const result = await prisma.hrms_d_finalsettlement_processing.update({
      where: { id: parseInt(id) },
      include: {
        hrms_d_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
        hrms_m_pay_component: {
          select: { id: true, component_name: true, component_code: true },
        },
      },
      data: {
        ...serializeSettlementData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error updating final settlement: ${error.message}`,
      500
    );
  }
};

//  Delete
const deleteFinalSettlement = async (id) => {
  try {
    await prisma.hrms_d_finalsettlement_processing.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting record: ${error.message}`, 500);
  }
};

module.exports = {
  createFinalSettlementProcessing,
  getAllFinalSettlements,
  getFinalSettlementById,
  updateFinalSettlement,
  deleteFinalSettlement,
};
