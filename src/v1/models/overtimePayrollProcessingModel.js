const { prisma } = require("../../utils/prismaProxy.js");

const CustomError = require("../../utils/CustomError");

// Serializer to prepare data for insert/update
const serializeOvertimeData = (data) => ({
  payroll_month: Number(data.payroll_month),
  payroll_year: Number(data.payroll_year),
  payroll_week: Number(data.payroll_week),
  pay_currency: Number(data.pay_currency),
  amount: data.overtime_amount ? parseFloat(data.overtime_amount) : 0,
  overtime_type: data.overtime_type || null,
  doc_date: data.doc_date ? new Date(data.doc_date) : null,
  je_transid: data.je_transid || null,
  status: data.status || "Pending",
  execution_date: data.execution_date ? new Date(data.execution_date) : null,
  approved1: data.approved1 || "N",
  approver1_id: data.approver1_id ? Number(data.approver1_id) : null,
  remarks: data.remarks || null,
  overtime_rate: data.overtime_rate ? parseFloat(data.overtime_rate) : 0,
});

// CREATE
// const createOvertimePayrollProcessing = async (data) => {
//   try {
//     const result = await prisma.hrms_d_employee_payroll_adjustment.create({
//       data: {
//         ...serializeOvertimeData(data),

//         // Prisma requires this format for relations
//         employee_payroll_adjustment_employee: {
//           connect: { id: Number(data.employee_id) },
//         },
//         employee_payroll_adjustment_component: {
//           connect: { id: Number(data.component_id) },
//         },
//         employee_payroll_adjustment_currency: {
//           connect: { id: Number(data.pay_currency) },
//         },
//         employee_payroll_adjustment_project: data.project_id
//           ? { connect: { id: Number(data.project_id) } }
//           : undefined,

//         employee_payroll_adjustment_center1: data.cost_center1_id
//           ? { connect: { id: Number(data.cost_center1_id) } }
//           : undefined,
//         employee_payroll_adjustment_center2: data.cost_center2_id
//           ? { connect: { id: Number(data.cost_center2_id) } }
//           : undefined,
//         employee_payroll_adjustment_center3: data.cost_center3_id
//           ? { connect: { id: Number(data.cost_center3_id) } }
//           : undefined,
//         employee_payroll_adjustment_center4: data.cost_center4_id
//           ? { connect: { id: Number(data.cost_center4_id) } }
//           : undefined,
//         employee_payroll_adjustment_center5: data.cost_center5_id
//           ? { connect: { id: Number(data.cost_center5_id) } }
//           : undefined,

//         createdate: new Date(),
//         createdby: data.createdby || 1,
//         log_inst: data.log_inst || 1,
//       },
//       include: {
//         employee_payroll_adjustment_employee: {
//           select: { id: true, full_name: true, employee_code: true },
//         },
//         employee_payroll_adjustment_component: {
//           select: { id: true, component_name: true },
//         },
//         employee_payroll_adjustment_currency: {
//           select: {
//             id: true,
//             currency_code: true,
//             currency_name: true,
//           },
//         },
//         employee_payroll_adjustment_center1: {
//           select: { id: true, name: true },
//         },
//         employee_payroll_adjustment_center2: {
//           select: { id: true, name: true },
//         },
//         employee_payroll_adjustment_center3: {
//           select: { id: true, name: true },
//         },
//         employee_payroll_adjustment_center4: {
//           select: { id: true, name: true },
//         },
//         employee_payroll_adjustment_center5: {
//           select: { id: true, name: true },
//         },
//       },
//     });

//     return result;
//   } catch (error) {
//     throw new CustomError(`Error creating record: ${error.message}`, 500);
//   }
// };

// const createOvertimePayrollProcessing = async (dataArray) => {
//   try {
//     if (!Array.isArray(dataArray) || dataArray.length === 0) {
//       throw new CustomError("Input must be a non-empty array", 400);
//     }

//     const errorResults = [];

//     await Promise.all(
//       dataArray.map(async (data) => {
//         try {
//           const requiredFields = [
//             "employee_id",
//             "payroll_month",
//             "payroll_year",
//             "payroll_week",
//             "component_id",
//             "pay_currency",
//             "status",
//           ];

//           const missing = requiredFields.filter(
//             (field) => !data[field] && data[field] !== 0
//           );

//           if (missing.length) {
//             errorResults.push({
//               employee_id: data.employee_id || null,
//               error: `Missing required fields: ${missing.join(", ")}`,
//             });
//             return;
//           }

//           const record = {
//             ...serializeOvertimeData(data),
//             createdby: data.createdby || 1,
//             createdate: new Date(),
//             log_inst: data.log_inst || 1,

//             employee_payroll_adjustment_employee: {
//               connect: { id: Number(data.employee_id) },
//             },
//             employee_payroll_adjustment_component: {
//               connect: { id: Number(data.component_id) },
//             },
//             employee_payroll_adjustment_currency: {
//               connect: { id: Number(data.pay_currency) },
//             },
//             employee_payroll_adjustment_project: data.project_id
//               ? { connect: { id: Number(data.project_id) } }
//               : undefined,
//             employee_payroll_adjustment_center1: data.cost_center1_id
//               ? { connect: { id: Number(data.cost_center1_id) } }
//               : undefined,
//             employee_payroll_adjustment_center2: data.cost_center2_id
//               ? { connect: { id: Number(data.cost_center2_id) } }
//               : undefined,
//             employee_payroll_adjustment_center3: data.cost_center3_id
//               ? { connect: { id: Number(data.cost_center3_id) } }
//               : undefined,
//             employee_payroll_adjustment_center4: data.cost_center4_id
//               ? { connect: { id: Number(data.cost_center4_id) } }
//               : undefined,
//             employee_payroll_adjustment_center5: data.cost_center5_id
//               ? { connect: { id: Number(data.cost_center5_id) } }
//               : undefined,
//           };

//           await prisma.hrms_d_employee_payroll_adjustment.create({
//             data: record,
//           });
//         } catch (err) {
//           errorResults.push({
//             employee_id: data.employee_id || null,
//             error: `Insert failed: ${err.message}`,
//           });
//         }
//       })
//     );

//     return errorResults;
//   } catch (error) {
//     console.error("Bulk insert error:", error);
//     throw new CustomError(
//       `Error creating overtime payroll records: ${error.message}`,
//       500
//     );
//   }
// };

const createOvertimePayrollProcessing = async (dataArray) => {
  try {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new CustomError("Input must be a non-empty array", 400);
    }

    const successResults = [];
    const errorResults = [];

    console.log(`Processing ${dataArray.length} overtime payroll records...`);

    for (const data of dataArray) {
      try {
        const requiredFields = [
          "employee_id",
          "payroll_month",
          "payroll_year",
          "payroll_week",
          "component_id",
          "pay_currency",
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
            ` Skipping employee_id=${
              data.employee_id || "Unknown"
            }: Missing fields - ${missingFields.join(", ")}`
          );
          continue;
        }

        const componentId = Number(data.component_id);

        const columnCheck = await prisma.$queryRawUnsafe(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'hrms_d_monthly_payroll_processing' 
          AND COLUMN_NAME = '${componentId}'
        `);

        if (columnCheck.length === 0) {
          await prisma.$executeRawUnsafe(`
            ALTER TABLE hrms_d_monthly_payroll_processing 
            ADD [${componentId}] DECIMAL(18,2) NULL
          `);
          console.log(` Added overtime component column [${componentId}]`);
        }

        const existingRecord = await prisma.$queryRawUnsafe(`
          SELECT TOP 1 id, [${componentId}] as component_value
          FROM hrms_d_monthly_payroll_processing
          WHERE employee_id = ${Number(data.employee_id)}
            AND payroll_month = ${Number(data.payroll_month)}
            AND payroll_year = ${Number(data.payroll_year)}
            AND payroll_week = ${Number(data.payroll_week)}
        `);

        const amount = Number(data.amount || 0);
        const userId = data.createdby || 1;
        const logInst = data.log_inst || 1;

        let result;

        if (existingRecord && existingRecord.length > 0) {
          const recordId = existingRecord[0].id;
          const currentComponentValue = Number(
            existingRecord[0].component_value || 0
          );
          const newComponentValue = currentComponentValue + amount;

          const updateQuery = `
            UPDATE hrms_d_monthly_payroll_processing
            SET 
              [${componentId}] = ${newComponentValue},
              pay_currency = ${Number(data.pay_currency)},
              status = '${data.status}',
              ${
                data.payroll_start_date
                  ? `payroll_start_date = '${new Date(
                      data.payroll_start_date
                    ).toISOString()}',`
                  : ""
              }
              ${
                data.payroll_end_date
                  ? `payroll_end_date = '${new Date(
                      data.payroll_end_date
                    ).toISOString()}',`
                  : ""
              }
              ${
                data.payroll_paid_days !== undefined
                  ? `payroll_paid_days = ${Number(data.payroll_paid_days)},`
                  : ""
              }
              ${
                data.project_id
                  ? `project_id = ${Number(data.project_id)},`
                  : ""
              }
              ${
                data.cost_center1_id
                  ? `cost_center1_id = ${Number(data.cost_center1_id)},`
                  : ""
              }
              ${
                data.cost_center2_id
                  ? `cost_center2_id = ${Number(data.cost_center2_id)},`
                  : ""
              }
              ${
                data.cost_center3_id
                  ? `cost_center3_id = ${Number(data.cost_center3_id)},`
                  : ""
              }
              ${
                data.cost_center4_id
                  ? `cost_center4_id = ${Number(data.cost_center4_id)},`
                  : ""
              }
              ${
                data.cost_center5_id
                  ? `cost_center5_id = ${Number(data.cost_center5_id)},`
                  : ""
              }
              ${
                data.remarks
                  ? `remarks = '${data.remarks.replace(/'/g, "''")}',`
                  : ""
              }
              updatedby = ${userId},
              updatedate = GETDATE()
            WHERE id = ${recordId}
          `;

          await prisma.$executeRawUnsafe(updateQuery);

          result = {
            action: "updated",
            id: recordId,
            employee_id: data.employee_id,
            component_id: componentId,
            previous_amount: currentComponentValue,
            new_amount: newComponentValue,
          };

          console.log(
            `Updated overtime payroll for employee ${data.employee_id}, component ${componentId}`
          );
        } else {
          const insertQuery = `
            INSERT INTO hrms_d_monthly_payroll_processing (
              employee_id,
              payroll_month,
              payroll_year,
              payroll_week,
              ${data.payroll_start_date ? "payroll_start_date," : ""}
              ${data.payroll_end_date ? "payroll_end_date," : ""}
              ${
                data.payroll_paid_days !== undefined ? "payroll_paid_days," : ""
              }
              pay_currency,
              [${componentId}],
              total_earnings,
              taxable_earnings,
              tax_amount,
              total_deductions,
              net_pay,
              status,
              ${data.project_id ? "project_id," : ""}
              ${data.cost_center1_id ? "cost_center1_id," : ""}
              ${data.cost_center2_id ? "cost_center2_id," : ""}
              ${data.cost_center3_id ? "cost_center3_id," : ""}
              ${data.cost_center4_id ? "cost_center4_id," : ""}
              ${data.cost_center5_id ? "cost_center5_id," : ""}
              ${data.remarks ? "remarks," : ""}
              processed,
              je_transid,
              approved1,
              approver1_id,
              createdate,
              createdby,
              updatedate,
              updatedby,
              log_inst
            )
            VALUES (
              ${Number(data.employee_id)},
              ${Number(data.payroll_month)},
              ${Number(data.payroll_year)},
              ${Number(data.payroll_week)},
              ${
                data.payroll_start_date
                  ? `'${new Date(data.payroll_start_date).toISOString()}',`
                  : ""
              }
              ${
                data.payroll_end_date
                  ? `'${new Date(data.payroll_end_date).toISOString()}',`
                  : ""
              }
              ${
                data.payroll_paid_days !== undefined
                  ? `${Number(data.payroll_paid_days)},`
                  : ""
              }
              ${Number(data.pay_currency)},
              ${amount},
              0.00,
              0.00,
              0.00,
              0.00,
              0.00,
              '${data.status}',
              ${data.project_id ? `${Number(data.project_id)},` : ""}
              ${data.cost_center1_id ? `${Number(data.cost_center1_id)},` : ""}
              ${data.cost_center2_id ? `${Number(data.cost_center2_id)},` : ""}
              ${data.cost_center3_id ? `${Number(data.cost_center3_id)},` : ""}
              ${data.cost_center4_id ? `${Number(data.cost_center4_id)},` : ""}
              ${data.cost_center5_id ? `${Number(data.cost_center5_id)},` : ""}
              ${data.remarks ? `'${data.remarks.replace(/'/g, "''")}',` : ""}
              'N',
              0,
              'N',
              0,
              GETDATE(),
              ${userId},
              GETDATE(),
              ${userId},
              ${logInst}
            )
          `;

          await prisma.$executeRawUnsafe(insertQuery);

          const insertedRecord = await prisma.$queryRawUnsafe(`
            SELECT TOP 1 id 
            FROM hrms_d_monthly_payroll_processing
            WHERE employee_id = ${Number(data.employee_id)}
              AND payroll_month = ${Number(data.payroll_month)}
              AND payroll_year = ${Number(data.payroll_year)}
              AND payroll_week = ${Number(data.payroll_week)}
            ORDER BY id DESC
          `);

          result = {
            action: "created",
            id: insertedRecord[0]?.id,
            employee_id: data.employee_id,
            component_id: componentId,
            amount: amount,
          };

          console.log(
            `Created overtime payroll for employee ${data.employee_id}, component ${componentId}`
          );
        }

        successResults.push(result);
      } catch (err) {
        errorResults.push({
          employee_id: data.employee_id || null,
          error: `Processing failed: ${err.message}`,
        });
        console.error(
          ` Processing failed for employee_id=${
            data.employee_id || "Unknown"
          }: ${err.message}`
        );
      }
    }

    console.log(` Overtime Payroll Processing Complete`);
    console.log(`Success: ${successResults.length}`);
    console.log(`Errors: ${errorResults.length}`);

    return {
      success: successResults.length > 0,
      successCount: successResults.length,
      errorCount: errorResults.length,
      successResults,
      errorResults,
      summary: {
        total: dataArray.length,
        processed: successResults.length,
        failed: errorResults.length,
      },
    };
  } catch (error) {
    console.error(" Bulk overtime payroll processing error:", error);
    throw new CustomError(
      `Error creating overtime payroll records: ${error.message}`,
      500
    );
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

// const callOvertimePostingSP = async (params) => {
//   try {
//     const {
//       paymonth,
//       payyear,
//       empidfrom,
//       empidto,
//       depidfrom,
//       depidto,
//       positionidfrom,
//       positionidto,
//       wage = "",
//     } = params;
//     console.log("Calling stored procedure with params:", {
//       paymonth,
//       payyear,
//       empidfrom,
//       empidto,
//       depidfrom,
//       depidto,
//       positionidfrom,
//       positionidto,
//       wage,
//     });

//     const result = await prisma.$queryRawUnsafe(`
//       EXEC sp_hrms_employee_overtime_posting
//         @paymonth = '${paymonth}',
//         @payyear = '${payyear}',
//         @empidfrom = '${empidfrom}',
//         @empidto = '${empidto}',
//         @depidfrom = '${depidfrom}',
//         @depidto = '${depidto}',
//         @positionidfrom = '${positionidfrom}',
//         @positionidto = '${positionidto}',
//         @wage = '${wage}'
//     `);
//     console.log("Successfully executed stored procedure", result);
//     return result;
//   } catch (error) {
//     console.error("SP Execution Failed:", error);
//     throw new CustomError("Overtime payroll processing failed", 500);
//   }
// };

const callOvertimePostingSP = async (params) => {
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
    console.log("Model calling SP with params:", params);

    const sanitize = (val) => {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    const result = await prisma.$queryRawUnsafe(`
      EXEC sp_hrms_employee_overtime_posting 
        @paymonth = ${sanitize(paymonth)},
        @payyear = ${sanitize(payyear)},
        @empidfrom = ${sanitize(empidfrom)},
        @empidto = ${sanitize(empidto)},
        @depidfrom = ${sanitize(depidfrom)},
        @depidto = ${sanitize(depidto)},
        @positionidfrom = ${sanitize(positionidfrom)},
        @positionidto = ${sanitize(positionidto)},
        @wage = '${wage || ""}'
    `);

    console.log("SP Result:", result);
    return result;
  } catch (error) {
    console.error("SP Execution Failed:", error);
    throw new CustomError("Overtime payroll processing failed", 500);
  }
};

module.exports = {
  createOvertimePayrollProcessing,
  findOvertimePayrollProcessingById,
  updateOvertimePayrollProcessing,
  deleteOvertimePayrollProcessing,
  getAllOvertimePayrollProcessing,
  callOvertimePostingSP,
};
