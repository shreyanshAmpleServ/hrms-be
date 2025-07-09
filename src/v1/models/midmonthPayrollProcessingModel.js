const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { id } = require("date-fns/locale");
const prisma = new PrismaClient();

// Serializer
// const serializeMidmonthPayrollData = (data) => ({
//   employee_id: Number(data.employee_id),
//   payroll_month: Number(data.payroll_month),
//   payroll_year: Number(data.payroll_year),
//   payroll_week: Number(data.payroll_week),
//   pay_currency: data.pay_currency,
//   component_id: Number(data.component_id),
//   // net_pay: data.net_pay,
//   amount: data.amount ? parseFloat(data.amount) : 0.0,
//   status: data.status || "Pending",
//   execution_date: data.execution_date ? new Date(data.execution_date) : null,
//   // pay_date: data.pay_date ? new Date(data.pay_date) : null,
//   doc_date: data.doc_date ? new Date(data.doc_date) : null,
//   processed: data.processed || "N",
//   je_transid: data.je_transid || null,
//   project_id: data.project_id || null,
//   cost_center1_id: data.cost_center1_id || null,
//   cost_center2_id: data.cost_center2_id || null,
//   cost_center3_id: data.cost_center3_id || null,
//   cost_center4_id: data.cost_center4_id || null,
//   cost_center5_id: data.cost_center5_id || null,
//   approved1: data.approved1 || "N",
//   approver1_id: data.approver1_id || null,
//   employee_email: data.employee_email || null,
//   remarks: data.remarks || null,
// });

const serializeMidmonthPayrollData = (data) => ({
  payroll_month: Number(data.payroll_month),
  payroll_year: Number(data.payroll_year),
  payroll_week: Number(data.payroll_week),
  amount: data.amount ? parseFloat(data.amount) : 0.0,
  status: data.status || "Pending",
  execution_date: data.execution_date ? new Date(data.execution_date) : null,
  doc_date: data.doc_date ? new Date(data.doc_date) : null,
  // processed: data.processed || "N",
  je_transid: data.je_transid || null,
  approved1: data.approved1 || "N",
  approver1_id: data.approver1_id || null,
  // employee_email: data.employee_email || null,
  remarks: data.remarks || null,
});

//  Create
// const createMidMonthPayrollProcessing = async (data) => {
//   try {
//     const result = await prisma.hrms_d_employee_payroll_deduction_schedule.create({
//       data: {
//         ...serializeMidmonthPayrollData(data),
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//       },
//       include: {
//         midmonth_payroll_processing_employee: {
//           select: {
//             id: true,
//             full_name: true,
//           },
//         },
//         midmonth_payroll_processing_currency: {
//           select: {
//             id: true,
//             currency_code: true,
//             currency_name: true,
//           },
//         },
//         midmonth_payroll_processing_project: {
//           select: {
//             id: true,
//             code: true,
//             name: true,
//           },
//         },
//         midmonth_payroll_processing_component: {
//           select: {
//             id: true,
//             component_name: true,
//           },
//         },
//         midmonth_payroll_processing_center1: {
//           select: { id: true, name: true },
//         },
//         midmonth_payroll_processing_center2: {
//           select: { id: true, name: true },
//         },
//         midmonth_payroll_processing_center3: {
//           select: { id: true, name: true },
//         },
//         midmonth_payroll_processing_center4: {
//           select: { id: true, name: true },
//         },
//         midmonth_payroll_processing_center5: {
//           select: { id: true, name: true },
//         },
//       },
//     });
//     return result;
//   } catch (error) {
//     throw new CustomError(
//       `Error creating mid-month payroll: ${error.message}`,
//       500
//     );
//   }
// };

const createMidMonthPayrollProcessing = async (dataArray) => {
  try {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new CustomError("Input must be a non-empty array", 400);
    }

    const errorResults = [];

    await Promise.all(
      dataArray.map(async (data) => {
        try {
          const requiredFields = [
            "employee_id",
            "payroll_month",
            "payroll_year",
            "payroll_week",
            "component_id",
            "status",
          ];

          const missingFields = requiredFields.filter(
            (field) => data[field] === undefined || data[field] === null
          );

          if (missingFields.length > 0) {
            errorResults.push({
              employee_id: data.employee_id || null,
              error: `Incomplete data: ${missingFields.join(", ")} required`,
            });
            console.warn(
              `Skipping employee_id=${
                data.employee_id || "Unknown"
              }: Missing fields - ${missingFields.join(", ")}`
            );
            return;
          }

          // const record = {
          //   ...serializeMidmonthPayrollData(data),
          //   createdby: data.createdby || 1,
          //   createdate: new Date(),
          //   log_inst: data.log_inst || 1,
          // };

          const record = {
            ...serializeMidmonthPayrollData(data),
            createdby: data.createdby || 1,
            createdate: new Date(),
            log_inst: data.log_inst || 1,

            employee_payroll_deduction_employee: {
              connect: { id: Number(data.employee_id) },
            },
            employee_payroll_deduction_component: {
              connect: { id: Number(data.component_id) },
            },
            employee_payroll_deduction_currency: data.pay_currency
              ? { connect: { id: Number(data.pay_currency) } }
              : undefined,
            employee_payroll_deduction_project: data.project_id
              ? { connect: { id: Number(data.project_id) } }
              : undefined,
            employee_payroll_deduction_center1: data.cost_center1_id
              ? { connect: { id: Number(data.cost_center1_id) } }
              : undefined,
            employee_payroll_deduction_center2: data.cost_center2_id
              ? { connect: { id: Number(data.cost_center2_id) } }
              : undefined,
            employee_payroll_deduction_center3: data.cost_center3_id
              ? { connect: { id: Number(data.cost_center3_id) } }
              : undefined,
            employee_payroll_deduction_center4: data.cost_center4_id
              ? { connect: { id: Number(data.cost_center4_id) } }
              : undefined,
            employee_payroll_deduction_center5: data.cost_center5_id
              ? { connect: { id: Number(data.cost_center5_id) } }
              : undefined,
          };

          await prisma.hrms_d_employee_payroll_deduction_schedule.create({
            data: record,
          });
        } catch (err) {
          errorResults.push({
            employee_id: data.employee_id || null,
            error: `Insert failed: ${err.message}`,
          });
          console.error(
            `Insert failed for employee_id=${data.employee_id || "Unknown"}: ${
              err.message
            }`
          );
        }
      })
    );

    return errorResults;
  } catch (error) {
    console.log("Bulk insert error:", error);
    throw new CustomError(
      `Error creating mid-month payroll records: ${error.message}`,
      500
    );
  }
};

const getAllMidMonthPayrollProcessing = async (
  search,
  page,
  size,
  startDate,
  endDate,
  payroll_month,
  payroll_year
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;
    const filters = {};

    if (search) {
      filters.OR = [
        { employee_email: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
      ];
    }
    if (payroll_month) {
      filters.payroll_month = parseInt(payroll_month);
    }
    if (payroll_year) {
      filters.payroll_year = parseInt(payroll_year);
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

    const data =
      await prisma.hrms_d_employee_payroll_deduction_schedule.findMany({
        where: {
          ...filters,
          midmonth_payroll_processing_component: {
            is_advance: "Y",
          },
        },
        skip,
        take: size,
        orderBy: { createdate: "desc" },
        include: {
          employee_payroll_deduction_employee: {
            select: {
              id: true,
              full_name: true,
            },
          },
          employee_payroll_deduction_component: {
            select: {
              id: true,
              component_name: true,
              is_advance: true,
            },
          },
          employee_payroll_deduction_currency: {
            select: {
              id: true,
              currency_code: true,
              currency_name: true,
            },
          },
          employee_payroll_deduction_project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          employee_payroll_deduction_center1: {
            select: { id: true, name: true },
          },
          employee_payroll_deduction_center2: {
            select: { id: true, name: true },
          },
          employee_payroll_deduction_center3: {
            select: { id: true, name: true },
          },
          employee_payroll_deduction_center4: {
            select: { id: true, name: true },
          },
          employee_payroll_deduction_center5: {
            select: { id: true, name: true },
          },
        },
      });
    console.log("Data retrieved:", data);

    const totalCount =
      await prisma.hrms_d_employee_payroll_deduction_schedule.count({
        where: {
          ...filters,
          midmonth_payroll_processing_component: {
            is_advance: "Y",
          },
        },
      });
    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError(`Error retrieving payrolls: ${error.message}`, 500);
  }
};

const findMidMonthPayrollProcessingById = async (id) => {
  try {
    const result =
      await prisma.hrms_d_employee_payroll_deduction_schedule.findUnique({
        where: { id: parseInt(id) },
      });
    if (!result) throw new CustomError("Payroll record not found", 404);
    return result;
  } catch (error) {
    throw new CustomError(
      `Error fetching payroll record: ${error.message}`,
      500
    );
  }
};

// Updates
const updateMidMonthPayrollProcessing = async (id, data) => {
  try {
    const result =
      await prisma.hrms_d_employee_payroll_deduction_schedule.update({
        where: { id: parseInt(id) },
        include: {
          employee_payroll_deduction_employee: {
            select: {
              id: true,
              full_name: true,
            },
          },
          employee_payroll_deduction_component: {
            select: {
              id: true,
              component_name: true,
              is_advance: true,
            },
          },
          employee_payroll_deduction_currency: {
            select: {
              id: true,
              currency_code: true,
              currency_name: true,
            },
          },
          employee_payroll_deduction_project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          employee_payroll_deduction_center1: {
            select: { id: true, name: true },
          },
          employee_payroll_deduction_center2: {
            select: { id: true, name: true },
          },
          employee_payroll_deduction_center3: {
            select: { id: true, name: true },
          },
          employee_payroll_deduction_center4: {
            select: { id: true, name: true },
          },
          employee_payroll_deduction_center5: {
            select: { id: true, name: true },
          },
        },

        data: {
          ...serializeMidmonthPayrollData(data),
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
      });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error updating mid-month payroll: ${error.message}`,
      500
    );
  }
};

// Delete
const deleteMidMonthPayrollProcessing = async (id) => {
  try {
    await prisma.hrms_d_employee_payroll_deduction_schedule.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting mid-month payroll: ${error.message}`,
      500
    );
  }
};

const callMidMonthPostingSP = async (params) => {
  try {
    const {
      paymonth,
      payyear,
      empidfrom,
      empidto,
      depidfrom,
      depidto,
      positionidfrom,
      positionidto,
      wage = "",
    } = params;
    console.log("Calling stored procedure with params:", {
      paymonth,
      payyear,
      empidfrom,
      empidto,
      depidfrom,
      depidto,
      positionidfrom,
      positionidto,
      wage,
    });

    const result = await prisma.$queryRawUnsafe(`
      EXEC sp_hrms_employee_midmonth_posting 
        @paymonth = '${paymonth}',
        @payyear = '${payyear}',
        @empidfrom = '${empidfrom}',
        @empidto = '${empidto}',
        @depidfrom = '${depidfrom}',
        @depidto = '${depidto}',
        @positionidfrom = '${positionidfrom}',
        @positionidto = '${positionidto}',
        @wage = '${wage}'
    `);
    console.log("Successfully executed stored procedure", result);

    return {
      success: true,
      message: "Mid-month payroll processed successfully",
      result: result,
    };
  } catch (error) {
    console.error("SP Execution Failed:", error);
    throw new CustomError("Mid-month payroll processing failed", 500);
  }
};

module.exports = {
  createMidMonthPayrollProcessing,
  findMidMonthPayrollProcessingById,
  updateMidMonthPayrollProcessing,
  deleteMidMonthPayrollProcessing,
  getAllMidMonthPayrollProcessing,
  callMidMonthPostingSP,
};
