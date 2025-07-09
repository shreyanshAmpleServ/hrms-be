const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const CustomError = require("../../utils/CustomError");

// Serializer to prepare data for insert/update
const serializeOvertimeData = (data) => ({
  employee_id: Number(data.employee_id),
  payroll_month: Number(data.payroll_month),
  payroll_year: Number(data.payroll_year),
  overtime_date: new Date(data.overtime_date),
  pay_currency: Number(data.pay_currency),
  component_id: Number(data.component_id),
  amount: data.amount ? parseFloat(data.amount) : 0,
  start_time: data.start_time,
  end_time: data.end_time,
  overtime_hours: parseFloat(data.overtime_hours),
  overtime_formula: data.overtime_formula || null,
  overtime_type: data.overtime_type || null,
  overtime_category: data.overtime_category || null,
  overtime_rate_multiplier: data.overtime_rate_multiplier
    ? parseFloat(data.overtime_rate_multiplier)
    : null,
  calculation_basis: data.calculation_basis || null,
  payroll_cycle_id: data.payroll_cycle_id
    ? Number(data.payroll_cycle_id)
    : null,
  linked_payslip_id: data.linked_payslip_id
    ? Number(data.linked_payslip_id)
    : null,
  doc_date: data.doc_date ? new Date(data.doc_date) : null,
  je_transid: data.je_transid || null,

  source_doc: data.source_doc || null,
  overtime_pay: parseFloat(data.overtime_pay),
  status: data.status || "Pending",
  execution_date: data.execution_date ? new Date(data.execution_date) : null,
  // pay_date: data.pay_date ? new Date(data.pay_date) : null,
  // pay_id: data.pay_id ? Number(data.pay_id) : null,
  project_id: data.project_id ? Number(data.project_id) : null,
  approved1: data.approved1 || "N",
  approver1_id: data.approver1_id ? Number(data.approver1_id) : null,
  remarks: data.remarks || null,
});

// CREATE
const createOvertimePayrollProcessing = async (data) => {
  try {
    const result = await prisma.hrms_d_employee_payroll_adjustment.create({
      data: {
        ...serializeOvertimeData(data),
        createdate: new Date(),
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
      include: {
        employee_payroll_adjustment_employee: {
          select: { id: true, full_name: true, employee_code: true },
        },
        employee_payroll_adjustment_component: {
          select: { id: true, component_name: true },
        },
        employee_payroll_adjustment_currency: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
        employee_payroll_adjustment_center1: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center2: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center3: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center4: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center5: {
          select: { id: true, name: true },
        },
      },
    });

    return result;
  } catch (error) {
    throw new CustomError(`Error creating record: ${error.message}`, 500);
  }
};

// GET ALL
const getAllOvertimePayrollProcessing = async (
  search,
  page,
  size,
  startDate,
  endDate,
  is_active
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;
    const filters = {};

    if (search) {
      filters.OR = [
        { name: { contains: search.toLowerCase() } },
        { external_code: { contains: search.toLowerCase() } },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const data = await prisma.hrms_d_employee_payroll_adjustment.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: { createdate: "desc" },
      include: {
        employee_payroll_adjustment_employee: {
          select: { id: true, full_name: true, employee_code: true },
        },
        employee_payroll_adjustment_component: {
          select: { id: true, component_name: true },
        },
        employee_payroll_adjustment_currency: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
        employee_payroll_adjustment_center1: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center2: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center3: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center4: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center5: {
          select: { id: true, name: true },
        },
      },
    });

    const totalCount = await prisma.hrms_d_employee_payroll_adjustment.count({
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
    console.log("Error", error);
    throw new CustomError(
      "Error retrieving overtime payroll procesing centers",
      503
    );
  }
};

// GET BY ID
const findOvertimePayrollProcessingById = async (id) => {
  const result = await prisma.hrms_d_employee_payroll_adjustment.findUnique({
    where: { id: Number(id) },
  });
  if (!result) throw new CustomError("Record not found", 404);
  return result;
};

// UPDATE
const updateOvertimePayrollProcessing = async (id, data) => {
  try {
    const result = await prisma.hrms_d_employee_payroll_adjustment.update({
      where: { id: Number(id) },
      data: {
        ...serializeOvertimeData(data),
        updatedate: new Date(),
        updatedby: data.updatedby || 1,
      },
      include: {
        employee_payroll_adjustment_employee: {
          select: { id: true, full_name: true, employee_code: true },
        },
        employee_payroll_adjustment_component: {
          select: { id: true, component_name: true },
        },
        employee_payroll_adjustment_currency: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
        employee_payroll_adjustment_center1: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center2: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center3: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center4: {
          select: { id: true, name: true },
        },
        employee_payroll_adjustment_center5: {
          select: { id: true, name: true },
        },
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(`Error updating record: ${error.message}`, 500);
  }
};

// DELETE
const deleteOvertimePayrollProcessing = async (id) => {
  try {
    await prisma.hrms_d_employee_payroll_adjustment.delete({
      where: { id: Number(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting record: ${error.message}`, 500);
  }
};

module.exports = {
  createOvertimePayrollProcessing,
  findOvertimePayrollProcessingById,
  updateOvertimePayrollProcessing,
  deleteOvertimePayrollProcessing,
  getAllOvertimePayrollProcessing,
};
