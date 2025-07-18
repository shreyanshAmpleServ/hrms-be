const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { record } = require("zod/v4");
const prisma = new PrismaClient();

// Serialize payroll data
const serializePayrollData = (data) => ({
  employee_id: Number(data.employee_id),
  payroll_month: Number(data.payroll_month),
  payroll_year: Number(data.payroll_year),
  payroll_week: Number(data.payroll_week) || 0,
  basic_salary: Number(data.basic_salary || 0),
  total_earnings: Number(data.total_earnings || 0),
  total_deductions: Number(data.total_deductions || 0),
  taxable_earnings: data.taxable_earnings ? Number(data.taxable_earnings) : 0,
  tax_amount: data.tax_amount ? Number(data.tax_amount) : 0,
  net_pay: Number(data.net_pay || 0),
  status: data.status || "",
  processed_on: data.processed_on ? new Date(data.processed_on) : null,
  remarks: data.remarks || "",
});

// const createMonthlyPayroll = async (data) => {
//   try {
//     const serializedData = serializePayrollData(data);
//     const { employee_id, payroll_month } = serializedData;

//     // Check if payroll already exists for the same employee and month
//     const existing = await prisma.hrms_d_monthly_payroll_processing.findFirst({
//       where: {
//         hrms_monthly_payroll_employee: { id: employee_id },
//         payroll_month: payroll_month,
//       },
//     });

//     if (existing) {
//       throw new CustomError(
//         `Payroll already exists for employee ID ${employee_id} in month ${payroll_month}`,
//         400
//       );
//     }

//     const reqData = await prisma.hrms_d_monthly_payroll_processing.create({
//       data: {
//         ...serializedData,
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//         hrms_monthly_payroll_employee: {
//           connect: { id: employee_id },
//         },
//       },
//       include: {
//         hrms_monthly_payroll_employee: {
//           select: {
//             id: true,
//             employee_code: true,
//             full_name: true,
//           },
//         },
//       },
//     });

//     return reqData;
//   } catch (error) {
//     throw new CustomError(
//       `Error creating payroll entry: ${error.message}`,
//       500
//     );
//   }
// };
const createMonthlyPayroll = async (data) => {
  try {
    const serializedData = serializePayrollData(data);
    const { employee_id, payroll_month } = serializedData;

    // Check if payroll already exists for the same employee and month
    // const existing = await prisma.hrms_d_monthly_payroll_processing.findFirst({
    //   where: {
    //     hrms_monthly_payroll_employee: { id: employee_id },
    //     payroll_month: payroll_month,
    //   },
    // });
    try {
      if (!employee_id || !payroll_month) {
        throw new CustomError("Missing employee_id or payroll_month", 400);
      }

      const result = await prisma.$queryRawUnsafe(`
  SELECT TOP 1 *
  FROM hrms_d_monthly_payroll_processing
  WHERE employee_id = ${Number(employee_id)}
    AND payroll_month = ${Number(payroll_month)}
`);

      if (!result || result.length > 0) {
        throw new CustomError(
          `Payroll already exists for employee ID ${employee_id} in month ${payroll_month}`,
          400
        );
      }
    } catch (error) {
      throw new CustomError(
        `Error fetching payroll entry: ${error.message}`,
        500
      );
    }

    const reqData = await prisma.hrms_d_monthly_payroll_processing.create({
      data: {
        ...serializedData,
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
        hrms_monthly_payroll_employee: {
          connect: { id: Number(data.employee_id) },
        },
      },
      include: {
        hrms_monthly_payroll_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating payroll entry: ${error.message}`,
      500
    );
  }
};

// Find payroll entry by ID
const findMonthlyPayrollById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_monthly_payroll_processing.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Payroll entry not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding payroll entry by ID: ${error.message}`,
      503
    );
  }
};

// Update payroll entry
const updateMonthlyPayroll = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_monthly_payroll_processing.update({
      where: { id: parseInt(id) },
      include: {
        hrms_monthly_payroll_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
      data: {
        ...serializePayrollData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating payroll entry: ${error.message}`,
      500
    );
  }
};

// Delete payroll entry
const deleteMonthlyPayroll = async (id) => {
  try {
    await prisma.hrms_d_monthly_payroll_processing.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting payroll entry: ${error.message}`,
      500
    );
  }
};

// Get all payroll entries
const getAllMonthlyPayroll = async (
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
        {
          hrms_monthly_payroll_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { payroll_month: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
        { remarks: { contains: search.toLowerCase() } },
      ];
    }
    // if (startDate && endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);
    //   if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    //     filters.createdate = { gte: start, lte: end };
    //   }
    // }

    const datas = await prisma.hrms_d_monthly_payroll_processing.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hrms_monthly_payroll_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    const totalCount = await prisma.hrms_d_monthly_payroll_processing.count({
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
    console.log("Payroll retreival error", error);

    throw new CustomError("Error retrieving payroll entries", 503);
  }
};

// const callMonthlyPayrollSP = async (params) => {
//   try {
//     const {
//       paymonth,
//       payyear,
//       empidfrom,
//       empidto,
//       // depidfrom,
//       // depidto,
//       positionidfrom,
//       positionidto,
//       loanflag,
//       grade,
//     } = params;
//     console.log("Model calling SP with params:", params);

//     const sanitize = (val) => {
//       const num = Number(val);
//       return isNaN(num) ? 0 : num;
//     };

//     const result = await prisma.$queryRawUnsafe(`
//       EXEC sp_hrms_monthly_payroll_processing
//        @paymonth = ${sanitize(paymonth)},
//        @payyear = ${sanitize(payyear)},
//        @empidfrom = ${sanitize(empidfrom)},
//        @empidto = ${sanitize(empidto)},
//        @positionidfrom = ${sanitize(positionidfrom)},
//        @positionidto = ${sanitize(positionidto)},
//        @loanflag = ${sanitize(loanflag)},
//        @grade = grade
//     `);

//     console.log("SP Result:", result);
//     return result;
//   } catch (error) {
//     console.error("SP Execution Failed:", error);
//     throw new CustomError("Monthly payroll processing failed", 500);
//   }
// };

const callMonthlyPayrollSP = async (params) => {
  try {
    const {
      paymonth,
      payyear,
      empidfrom,
      empidto,
      positionidfrom,
      positionidto,
      dptfrom,
      dptto,
      branchfrom,
      branchto,
      loanflag,
      grade,
    } = params;

    console.log("Model calling SP with params:", params);

    const result = await prisma.$queryRawUnsafe(`
      EXEC sp_hrms_monthly_payroll_processing  
        @paymonth = ${parseInt(paymonth)},
        @payyear = ${parseInt(payyear)},
        @EmpIdFrom = '${empidfrom}',
        @EmpIdTo = '${empidto}',
        @positionFrom = '${positionidfrom}',
        @positionTo = '${positionidto}',
        @dptFrom = '${dptfrom}',
        @dpTo = '${dptto}',
        @branchFrom = '${branchfrom}',
        @branchTo = '${branchto}',
        @Loanflag = ${parseInt(loanflag)},
        @Grade = '${grade}'
    `);

    console.log("SP Result:", result);
    return result;
  } catch (error) {
    console.error("SP Execution Failed:", error);
    throw new CustomError("Monthly payroll processing failed", 500);
  }
};

const triggerMonthlyPayrollCalculationSP = async ({
  employee_id,
  taxable_amount,
}) => {
  try {
    if (!employee_id || !taxable_amount) {
      throw new CustomError("Missing employee_id or taxable_amount", 400);
    }

    const result = await prisma.$queryRawUnsafe(`
      EXEC sp_hrms_taxable_amount 
        @employee_id = ${parseInt(employee_id)}, 
        @taxable_amount = ${parseFloat(taxable_amount)}
    `);

    return result;
  } catch (error) {
    console.error("SP Execution Error:", error);
    throw new CustomError(
      `Stored procedure execution failed: ${error.message}`,
      500
    );
  }
};

const getComponentNames = async () => {
  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT * FROM vw_hrms_get_component_names`
    );
    return result;
  } catch (error) {
    console.log("Error", error);
    throw new CustomError("Failed to fetch component names", 500);
  }
};

// const createOrUpdatePayrollBulk = async (rows, user) => {
//   const processed = [];

//   try {
//     if (!Array.isArray(rows)) {
//       throw new Error('Expected "rows" to be an array.');
//     }

//     for (const row of rows) {
//       const employee_id = Number(row.employee_id);
//       const payroll_month = Number(
//         row.payroll_month || new Date().getMonth() + 1
//       );
//       const payroll_year = Number(row.payroll_year || new Date().getFullYear());

//       const componentData = {};
//       for (const key in row) {
//         if (/^\d+$/.test(key)) {
//           componentData[`_${key}`] = Number(row[key] || 0);
//         }
//       }

//       const payrollData = {
//         employee_id,
//         payroll_month,
//         payroll_year,
//         net_pay: Number(row.net_pay || 0),
//         total_earnings: Number(row.total_earnings || 0),
//         total_deductions: Number(row.total_deductions || 0),
//         taxable_earnings: Number(row.TaxableIncome || 0),
//         tax_amount: Number(row.TaxPayee || 0),
//         status: row.status || "",
//         remarks: row.remarks || "",
//         log_inst: user.log_inst,
//         pay_currency: row.Currency || null,
//         ...componentData,
//       };

//       const existing = await prisma.hrms_d_monthly_payroll_processing.findFirst(
//         {
//           where: {
//             employee_id,
//             payroll_month,
//             payroll_year,
//           },
//         }
//       );

//       let result;
//       if (existing) {
//         result = await prisma.hrms_d_monthly_payroll_processing.update({
//           where: { id: existing.id },
//           data: {
//             ...payrollData,
//             updatedby: user.id,
//             updatedate: new Date(),
//           },
//         });
//       } else {
//         result = await prisma.hrms_d_monthly_payroll_processing.create({
//           data: {
//             ...payrollData,
//             createdby: user.id,
//             createdate: new Date(),
//           },
//         });
//       }

//       processed.push(result);
//     }
//     return processed;
//   } catch (error) {
//     console.error("Error in bulk create or update payroll:", error);
//     throw new Error(
//       `Failed to process payroll bulk operation: ${error.message}`
//     );
//   }
// };

// const createOrUpdatePayrollBulk = async (rows, user) => {
//   const processed = [];

//   try {
//     if (!Array.isArray(rows)) {
//       throw new Error('Expected "rows" to be an array.');
//     }

//     for (const row of rows) {
//       const employee_id = Number(row.employee_id);
//       const payroll_month = Number(
//         row.payroll_month || new Date().getMonth() + 1
//       );
//       const payroll_year = Number(row.payroll_year || new Date().getFullYear());

//       const componentData = {};
//       for (const key in row) {
//         if (/^\d+$/.test(key)) {
//           componentData[`_${key}`] = Number(row[key] || 0);
//         }
//       }

//       const payrollData = {
//         employee_id,
//         payroll_month,
//         payroll_year,
//         payroll_week: Number(row.payroll_week || 0),
//         basic_salary: Number(row.basic_salary || 0),
//         net_pay: Number(row.net_pay || 0),
//         total_earnings: Number(row.total_earnings || 0),
//         total_deductions: Number(row.total_deductions || 0),
//         taxable_earnings: Number(row.TaxableIncome || 0),
//         tax_amount: Number(row.TaxPayee || 0),
//         status: row.status || "",
//         remarks: row.remarks || "",
//         log_inst: user.log_inst,
//         ...componentData,
//       };

//       // Check if payroll record already exists
//       const existing = await prisma.$queryRaw`
//         SELECT TOP 1 id
//         FROM hrms_d_monthly_payroll_processing
//         WHERE employee_id = ${employee_id}
//           AND payroll_month = ${payroll_month}
//           AND payroll_year = ${payroll_year}
//       `;

//       let result;

//       if (existing.length > 0) {
//         result = await prisma.$executeRaw`
//           UPDATE hrms_d_monthly_payroll_processing
//           SET
//             payroll_week = ${payrollData.payroll_week},
//             basic_salary = ${payrollData.basic_salary},
//             net_pay = ${payrollData.net_pay},
//             total_earnings = ${payrollData.total_earnings},
//             total_deductions = ${payrollData.total_deductions},
//             taxable_earnings = ${payrollData.taxable_earnings},
//             tax_amount = ${payrollData.tax_amount},
//             status = ${payrollData.status},
//             remarks = ${payrollData.remarks},
//             updatedby = ${user.id},
//             updatedate = GETDATE()
//           WHERE id = ${existing[0].id}
//         `;
//       } else {
//         result = await prisma.$executeRaw`
//           INSERT INTO hrms_d_monthly_payroll_processing (
//             employee_id, payroll_month, payroll_year, payroll_week, basic_salary,
//             net_pay, total_earnings, total_deductions, taxable_earnings, tax_amount,
//             status, remarks, log_inst, createdby, createdate
//           )
//           VALUES (
//             ${payrollData.employee_id}, ${payrollData.payroll_month}, ${payrollData.payroll_year},
//             ${payrollData.payroll_week}, ${payrollData.basic_salary}, ${payrollData.net_pay},
//             ${payrollData.total_earnings}, ${payrollData.total_deductions}, ${payrollData.taxable_earnings},
//             ${payrollData.tax_amount}, ${payrollData.status}, ${payrollData.remarks},
//             ${payrollData.log_inst}, ${user.id}, GETDATE()
//           )
//         `;
//       }

//       processed.push({
//         employee_id,
//         payroll_month,
//         payroll_year,
//         action: existing.length > 0 ? "updated" : "created",
//         result,
//       });
//     }

//     return processed;
//   } catch (error) {
//     console.error("Error in bulk create or update payroll:", error);
//     throw new Error(
//       `Failed to process payroll bulk operation: ${error.message}`
//     );
//   }
// };
//change

// const createOrUpdatePayrollBulk = async (rows, user) => {
//   const processed = [];

//   const safeDate = (val) => {
//     if (!val) return "NULL";
//     const d = new Date(val);
//     return isNaN(d) ? "NULL" : `'${d.toISOString()}'`;
//   };

//   const safeString = (val) => (val ? `'${val.replace(/'/g, "''")}'` : "NULL");

//   const safeNumber = (val, def = 0) => {
//     const num = Number(val);
//     return isNaN(num) ? def : num;
//   };

//   const safeDecimal = (val, def = 0) => {
//     const num = Number(val);
//     return isNaN(num) ? def.toFixed(2) : num.toFixed(2);
//   };

//   try {
//     for (const row of rows) {
//       const employee_id = safeNumber(row.employee_id);
//       const payroll_month = safeNumber(
//         row.payroll_month,
//         new Date().getMonth() + 1
//       );
//       const payroll_year = safeNumber(
//         row.payroll_year,
//         new Date().getFullYear()
//       );

//       const staticCols = {
//         employee_id,
//         payroll_month,
//         payroll_year,
//         payroll_week: safeNumber(row.payroll_week, 0),
//         payroll_start_date: safeDate(row.payroll_start_date),
//         payroll_end_date: safeDate(row.payroll_end_date),
//         payroll_paid_days: safeNumber(row.payroll_paid_days),
//         pay_currency: safeString(row.Currency),
//         total_earnings: safeDecimal(row.total_earnings),
//         taxable_earnings: safeDecimal(row.TaxableIncome),
//         tax_amount: safeDecimal(row.TaxPayee),
//         total_deductions: safeDecimal(row.total_deductions),
//         net_pay: safeDecimal(row.net_pay),
//         status: safeString(row.status || "N"),
//         execution_date: safeDate(row.execution_date),
//         pay_date: safeDate(row.pay_date),
//         doc_date: safeDate(row.doc_date),
//         processed: safeString(row.processed || "N"),
//         je_transid: safeNumber(row.je_transid),
//         project_id: safeNumber(row.project_id),
//         cost_center1_id: safeNumber(row.cost_center1_id),
//         cost_center2_id: safeNumber(row.cost_center2_id),
//         cost_center3_id: safeNumber(row.cost_center3_id),
//         cost_center4_id: safeNumber(row.cost_center4_id),
//         cost_center5_id: safeNumber(row.cost_center5_id),
//         approved1: safeString(row.approved1 || "N"),
//         approver1_id: safeNumber(row.approver1_id),
//         employee_email: safeString(row.employee_email),
//         remarks: safeString(row.remarks),
//         log_inst: safeString(user.log_inst),
//         createdby: user.id,
//         createdate: "GETDATE()",
//         updatedby: user.id,
//         updatedate: "GETDATE()",
//       };

//       const componentCols = {};
//       for (const key in row) {
//         if (/^\d+$/.test(key)) {
//           componentCols[key] = safeNumber(row[key]);
//         }
//       }

//       const allCols = {};
//       Object.entries({ ...staticCols, ...componentCols }).forEach(([k, v]) => {
//         allCols[`[${k}]`] = v;
//       });

//       const exists = await prisma.$queryRawUnsafe(`
//         SELECT id FROM hrms_d_monthly_payroll_processing
//         WHERE employee_id = ${employee_id}
//         AND payroll_month = ${payroll_month}
//         AND payroll_year = ${payroll_year}
//       `);

//       let sql;
//       if (exists.length > 0) {
//         const setClause = Object.entries(allCols)
//           .map(([key, val]) => `${key} = ${val}`)
//           .join(", ");
//         sql = `
//           UPDATE hrms_d_monthly_payroll_processing
//           SET ${setClause}
//           WHERE employee_id = ${employee_id}
//             AND payroll_month = ${payroll_month}
//             AND payroll_year = ${payroll_year}
//         `;
//       } else {
//         const columns = Object.keys(allCols).join(", ");
//         const values = Object.values(allCols)
//           .map((v) => (v === "GETDATE()" ? v : v))
//           .join(", ");
//         sql = `
//           INSERT INTO hrms_d_monthly_payroll_processing (${columns})
//           VALUES (${values})
//         `;
//       }

//       await prisma.$executeRawUnsafe(sql);

//       processed.push({
//         employee_id,
//         payroll_month,
//         payroll_year,
//         action: exists.length > 0 ? "updated" : "inserted",
//         record: fullRecord || null,
//       });
//     }

//     return processed;
//   } catch (error) {
//     console.error("Raw payroll error:", error);
//     throw new Error(
//       `Failed to process payroll bulk operation: ${error.message}`
//     );
//   }
// };

const createOrUpdatePayrollBulk = async (rows, user) => {
  const processed = [];

  const safeDate = (val) => {
    if (!val) return "NULL";
    const d = new Date(val);
    return isNaN(d) ? "NULL" : `'${d.toISOString()}'`;
  };

  const safeString = (val) => (val ? `'${val.replace(/'/g, "''")}'` : "NULL");

  const safeNumber = (val, def = 0) => {
    const num = Number(val);
    return isNaN(num) ? def : num;
  };

  const safeDecimal = (val, def = 0) => {
    const num = Number(val);
    return isNaN(num) ? def.toFixed(2) : num.toFixed(2);
  };

  try {
    for (const row of rows) {
      const employee_id = safeNumber(row.employee_id);
      const payroll_month = safeNumber(
        row.payroll_month,
        new Date().getMonth() + 1
      );
      const payroll_year = safeNumber(
        row.payroll_year,
        new Date().getFullYear()
      );

      const staticCols = {
        employee_id,
        payroll_month,
        payroll_year,
        payroll_week: safeNumber(row.payroll_week, 0),
        payroll_start_date: safeDate(row.payroll_start_date),
        payroll_end_date: safeDate(row.payroll_end_date),
        payroll_paid_days: safeNumber(row.payroll_paid_days),
        pay_currency: row.Currency,

        total_earnings: safeDecimal(row.total_earnings),
        taxable_earnings: safeDecimal(row.TaxableIncome),
        tax_amount: safeDecimal(row.TaxPayee),
        total_deductions: safeDecimal(row.total_deductions),
        net_pay: safeDecimal(row.net_pay),
        status: safeString(row.status || "N"),
        execution_date: safeDate(row.execution_date),
        pay_date: safeDate(row.pay_date),
        doc_date: safeDate(row.doc_date),
        processed: safeString(row.processed || "N"),
        je_transid: safeNumber(row.je_transid),
        project_id: safeNumber(row.project_id),
        cost_center1_id: safeNumber(row.cost_center1_id),
        cost_center2_id: safeNumber(row.cost_center2_id),
        cost_center3_id: safeNumber(row.cost_center3_id),
        cost_center4_id: safeNumber(row.cost_center4_id),
        cost_center5_id: safeNumber(row.cost_center5_id),
        approved1: safeString(row.approved1 || "N"),
        approver1_id: safeNumber(row.approver1_id),
        employee_email: safeString(row.employee_email),
        remarks: safeString(row.remarks),
        log_inst: safeString(user.log_inst),
        createdby: user.id,
        createdate: "GETDATE()",
        updatedby: user.id,
        updatedate: "GETDATE()",
      };

      const componentCols = {};
      for (const key in row) {
        if (/^\d+$/.test(key)) {
          componentCols[key] = safeNumber(row[key]);
        }
      }

      const allCols = {};
      Object.entries({ ...staticCols, ...componentCols }).forEach(([k, v]) => {
        allCols[`[${k}]`] = v;
      });

      const exists = await prisma.$queryRawUnsafe(`
        SELECT id FROM hrms_d_monthly_payroll_processing
        WHERE employee_id = ${employee_id}
        AND payroll_month = ${payroll_month}
        AND payroll_year = ${payroll_year}
      `);

      let sql;
      let action;
      if (exists.length > 0) {
        const setClause = Object.entries(allCols)
          .map(([key, val]) => `${key} = ${val}`)
          .join(", ");
        sql = `
          UPDATE hrms_d_monthly_payroll_processing
          SET ${setClause}
          WHERE employee_id = ${employee_id}
            AND payroll_month = ${payroll_month}
            AND payroll_year = ${payroll_year}
        `;
        action = "updated";
      } else {
        const columns = Object.keys(allCols).join(", ");
        const values = Object.values(allCols)
          .map((v) => (v === "GETDATE()" ? v : v))
          .join(", ");
        sql = `
          INSERT INTO hrms_d_monthly_payroll_processing (${columns})
          VALUES (${values})
        `;
        action = "inserted";
      }

      await prisma.$executeRawUnsafe(sql);

      const [fullRecord] = await prisma.$queryRawUnsafe(`
        SELECT * FROM hrms_d_monthly_payroll_processing
        WHERE employee_id = ${employee_id}
        AND payroll_month = ${payroll_month}
        AND payroll_year = ${payroll_year}
      `);

      processed.push({
        employee_id,
        payroll_month,
        payroll_year,
        action,
        record: fullRecord || null,
      });
    }

    return processed;
  } catch (error) {
    console.error("Raw payroll error:", error);
    throw new Error(
      `Failed to process payroll bulk operation: ${error.message}`
    );
  }
};

// const getGeneratedMonthlyPayroll = async (
//   search,
//   page = 1,
//   size = 10,
//   startDate,
//   endDate
// ) => {
//   try {
//     page = parseInt(page) || 1;
//     size = parseInt(size) || 10;
//     const offset = (page - 1) * size;

//     let whereClause = `WHERE 1=1`;

//     if (search) {
//       const term = search.toLowerCase().replace(/'/g, "''");
//       whereClause += `
//         AND (
//           LOWER(mp.status) LIKE '%${term}%'
//           OR CAST(mp.payroll_month AS VARCHAR) LIKE '%${term}%'
//           OR CAST(mp.payroll_year AS VARCHAR) LIKE '%${term}%'
//           OR LOWER(mp.remarks) LIKE '%${term}%'
//           OR LOWER(mp.employee_email) LIKE '%${term}%'
//           OR LOWER(emp.full_name) LIKE '%${term}%'
//           OR LOWER(emp.employee_code) LIKE '%${term}%'
//         )
//       `;
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate).toISOString();
//       const end = new Date(endDate).toISOString();
//       whereClause += ` AND mp.createdate BETWEEN '${start}' AND '${end}'`;
//     }

//     const query = `
//       SELECT
//         mp.*,
//         emp.id AS employee_id,
//         emp.full_name AS employee_full_name,
//         emp.employee_code AS employee_code
//       FROM hrms_d_monthly_payroll_processing mp
//       LEFT JOIN hrms_d_employee emp ON emp.id = mp.employee_id
//       ${whereClause}
//       ORDER BY mp.updatedate DESC
//       OFFSET ${offset} ROWS FETCH NEXT ${size} ROWS ONLY;
//     `;

//     const rawData = await prisma.$queryRawUnsafe(query);

//     const data = rawData.map((row) => {
//       const { employee_id, employee_full_name, employee_code, ...payrollData } =
//         row;

//       return {
//         ...payrollData,
//         hrms_monthly_payroll_employee: {
//           id: employee_id,
//           full_name: employee_full_name,
//           employee_code,
//         },
//       };
//     });

//     const countQuery = `
//       SELECT COUNT(*) AS count
//       FROM hrms_d_monthly_payroll_processing mp
//       LEFT JOIN hrms_d_employee emp ON emp.id = mp.employee_id
//       ${whereClause};
//     `;

//     const countResult = await prisma.$queryRawUnsafe(countQuery);
//     const totalCount = parseInt(countResult[0].count, 10);
//     const totalPages = Math.ceil(totalCount / size);

//     return {
//       data,
//       currentPage: page,
//       size,
//       totalPages,
//       totalCount,
//     };
//   } catch (error) {
//     console.error("Payroll retrieval error", error);
//     throw new CustomError("Error retrieving payroll entries", 503);
//   }
// };

// const getGeneratedMonthlyPayroll = async (
//   search,
//   page = 1,
//   size = 10,
//   startDate,
//   endDate,
//   employee_id,
//   payroll_month,
//   payroll_year
// ) => {
//   try {
//     page = parseInt(page) || 1;
//     size = parseInt(size) || 10;
//     const offset = (page - 1) * size;

//     let whereClause = `WHERE 1=1`;

//     if (search) {
//       const term = search.toLowerCase().replace(/'/g, "''");
//       whereClause += `
//         AND (
//           LOWER(mp.status) LIKE '%${term}%'
//           OR CAST(mp.payroll_month AS VARCHAR) LIKE '%${term}%'
//           OR CAST(mp.payroll_year AS VARCHAR) LIKE '%${term}%'
//           OR LOWER(mp.remarks) LIKE '%${term}%'
//           OR LOWER(mp.employee_email) LIKE '%${term}%'
//           OR LOWER(emp.full_name) LIKE '%${term}%'
//           OR LOWER(emp.employee_code) LIKE '%${term}%'
//         )
//       `;
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate).toISOString();
//       const end = new Date(endDate).toISOString();
//       whereClause += ` AND mp.createdate BETWEEN '${start}' AND '${end}'`;
//     }

//     if (
//       employee_id !== undefined &&
//       employee_id !== null &&
//       employee_id !== ""
//     ) {
//       whereClause += ` AND mp.employee_id = ${Number(employee_id)}`;
//     }

//     if (
//       payroll_month !== undefined &&
//       payroll_month !== null &&
//       payroll_month !== ""
//     ) {
//       whereClause += ` AND mp.payroll_month = ${Number(payroll_month)}`;
//     }

//     if (
//       payroll_year !== undefined &&
//       payroll_year !== null &&
//       payroll_year !== ""
//     ) {
//       whereClause += ` AND CAST(mp.payroll_year AS VARCHAR) = '${payroll_year}'`;
//     }

//     const query = `
//       SELECT
//         mp.*,
//         emp.id AS employee_id,
//         emp.full_name AS employee_full_name,
//         emp.employee_code AS employee_code
//       FROM hrms_d_monthly_payroll_processing mp
//       LEFT JOIN hrms_d_employee emp ON emp.id = mp.employee_id
//       LEFT JOIN hrms_
//       ${whereClause}
//       ORDER BY mp.updatedate DESC
//       OFFSET ${offset} ROWS FETCH NEXT ${size} ROWS ONLY;
//     `;

//     const rawData = await prisma.$queryRawUnsafe(query);

//     const data = rawData.map((row) => {
//       const { employee_id, employee_full_name, employee_code, ...payrollData } =
//         row;

//       return {
//         ...payrollData,
//         hrms_monthly_payroll_employee: {
//           id: employee_id,
//           full_name: employee_full_name,
//           employee_code,
//         },
//       };
//     });

//     const countQuery = `
//       SELECT COUNT(*) AS count
//       FROM hrms_d_monthly_payroll_processing mp
//       LEFT JOIN hrms_d_employee emp ON emp.id = mp.employee_id
//       ${whereClause};
//     `;

//     const countResult = await prisma.$queryRawUnsafe(countQuery);
//     const totalCount = parseInt(countResult[0].count, 10);
//     const totalPages = Math.ceil(totalCount / size);

//     return {
//       data,
//       currentPage: page,
//       size,
//       totalPages,
//       totalCount,
//     };
//   } catch (error) {
//     console.error("Payroll retrieval error", error);
//     throw new CustomError("Error retrieving payroll entries", 503);
//   }
// };

const getGeneratedMonthlyPayroll = async (
  search,
  page = 1,
  size = 10,
  startDate,
  endDate,
  employee_id,
  payroll_month,
  payroll_year
) => {
  try {
    page = parseInt(page) || 1;
    size = parseInt(size) || 10;
    const offset = (page - 1) * size;

    let whereClause = `WHERE 1=1`;

    if (search) {
      const term = search.toLowerCase().replace(/'/g, "''");
      whereClause += `
        AND (
          LOWER(mp.status) LIKE '%${term}%'
          OR CAST(mp.payroll_month AS VARCHAR) LIKE '%${term}%'
          OR CAST(mp.payroll_year AS VARCHAR) LIKE '%${term}%'
          OR LOWER(mp.remarks) LIKE '%${term}%'
          OR LOWER(mp.employee_email) LIKE '%${term}%'
          OR LOWER(emp.full_name) LIKE '%${term}%'
          OR LOWER(emp.employee_code) LIKE '%${term}%'
          OR LOWER(cur.currency_name) LIKE '%${term}%'
          OR LOWER(cur.currency_code) LIKE '%${term}%'
        )
      `;
    }

    if (startDate && endDate) {
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate).toISOString();
      whereClause += ` AND mp.createdate BETWEEN '${start}' AND '${end}'`;
    }

    if (
      employee_id !== undefined &&
      employee_id !== null &&
      employee_id !== ""
    ) {
      whereClause += ` AND mp.employee_id = ${Number(employee_id)}`;
    }

    if (
      payroll_month !== undefined &&
      payroll_month !== null &&
      payroll_month !== ""
    ) {
      whereClause += ` AND mp.payroll_month = ${Number(payroll_month)}`;
    }

    if (
      payroll_year !== undefined &&
      payroll_year !== null &&
      payroll_year !== ""
    ) {
      whereClause += ` AND CAST(mp.payroll_year AS VARCHAR) = '${payroll_year}'`;
    }

    const query = `
      SELECT 
        mp.*,
        emp.id AS employee_id,
        emp.full_name AS employee_full_name,
        emp.employee_code AS employee_code,
        cur.id AS id,
        cur.currency_code AS currency_code,
        cur.currency_name AS currency_name
      FROM hrms_d_monthly_payroll_processing mp
      LEFT JOIN hrms_d_employee emp ON emp.id = mp.employee_id
      LEFT JOIN hrms_m_currency_master cur ON cur.id = mp.id
      ${whereClause}
      ORDER BY mp.updatedate DESC
      OFFSET ${offset} ROWS FETCH NEXT ${size} ROWS ONLY;
    `;

    const rawData = await prisma.$queryRawUnsafe(query);

    const data = rawData.map((row) => {
      const {
        employee_id,
        employee_full_name,
        employee_code,
        id,
        currency_code,
        currency_name,
        ...payrollData
      } = row;

      return {
        ...payrollData,
        hrms_monthly_payroll_employee: {
          id: employee_id,
          full_name: employee_full_name,
          employee_code,
        },
        hrms_monthly_payroll_currency: {
          id: id,
          currency_code,
          currency_name,
        },
      };
    });

    const countQuery = `
      SELECT COUNT(*) AS count
      FROM hrms_d_monthly_payroll_processing mp
      LEFT JOIN hrms_d_employee emp ON emp.id = mp.employee_id
      LEFT JOIN hrms_m_currency_master cur ON cur.id = mp.id
      ${whereClause};
    `;

    const countResult = await prisma.$queryRawUnsafe(countQuery);
    const totalCount = parseInt(countResult[0].count, 10);
    const totalPages = Math.ceil(totalCount / size);

    return {
      data,
      currentPage: page,
      size,
      totalPages,
      totalCount,
    };
  } catch (error) {
    console.error("Payroll retrieval error", error);
    throw new CustomError("Error retrieving payroll entries", 503);
  }
};

module.exports = {
  createMonthlyPayroll,
  findMonthlyPayrollById,
  updateMonthlyPayroll,
  deleteMonthlyPayroll,
  getAllMonthlyPayroll,
  callMonthlyPayrollSP,
  getComponentNames,
  triggerMonthlyPayrollCalculationSP,
  createOrUpdatePayrollBulk,
  getGeneratedMonthlyPayroll,
};
