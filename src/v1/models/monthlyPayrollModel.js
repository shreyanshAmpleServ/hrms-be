const { prisma, asyncLocalStorage } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { record } = require("zod/v4");
const { getPrismaClient } = require("../../config/db.js");
const { PrismaClient } = require("@prisma/client");

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

const createMonthlyPayroll = async (data) => {
  console.log("Data received:", data);
  try {
    const serializedData = serializePayrollData(data);
    const { employee_id, payroll_month } = serializedData;
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
  const prismaClient = new PrismaClient();

  try {
    console.log("ID received:", id, "Type:", typeof id);
    if (!id) {
      throw new CustomError("ID parameter is required", 400);
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new CustomError("Invalid ID parameter", 400);
    }
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
  } finally {
    await prismaClient.$disconnect();
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

// Get all payroll entries
// const getAllMonthlyPayroll = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate,
//   payroll_month,
//   payroll_year
// ) => {
//   try {
//     page = !page || page == 0 ? 1 : page;
//     size = size || 10;
//     const skip = (page - 1) * size || 0;

//     const filters = {};
//     if (search) {
//       filters.OR = [
//         {
//           hrms_monthly_payroll_employee: {
//             full_name: { contains: search.toLowerCase() },
//           },
//         },
//         { payroll_month: { contains: search.toLowerCase() } },
//         { status: { contains: search.toLowerCase() } },
//         { remarks: { contains: search.toLowerCase() } },
//       ];
//     }
//     const datas = await prisma.hrms_d_monthly_payroll_processing.findMany({
//       where: filters,
//       skip,
//       take: size,
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
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
//     const totalCount = await prisma.hrms_d_monthly_payroll_processing.count({
//       where: filters,
//     });

//     return {
//       data: datas,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//     };
//   } catch (error) {
//     console.log("Payroll retreival error", error);

//     throw new CustomError("Error retrieving payroll entries", 503);
//   }
// };

const getAllMonthlyPayroll = async (
  search,
  page,
  size,
  startDate,
  endDate,
  payroll_month,
  payroll_year,
  is_overtime,
  is_advance,
  empidto = "",
  empidfrom = "",
  depidfrom = "",
  depidto = "",
  positionidfrom = "",
  positionidto = "",
  wage = ""
) => {
  try {
    console.log("=== getAllMonthlyPayroll START ===");
    console.log("Input Parameters:", {
      search,
      page,
      size,
      startDate,
      endDate,
      payroll_month,
      payroll_year,
      is_overtime,
      is_advance,
      empidto,
      empidfrom,
      depidfrom,
      depidto,
      positionidfrom,
      positionidto,
      wage,
    });

    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    console.log("Pagination Settings:", { page, size, skip });

    let overtimeEmployeeIds = [];

    if (is_overtime === true || is_overtime === "Y" || is_overtime === "true") {
      console.log("Processing OVERTIME filter...");

      const month = String(payroll_month || new Date().getMonth() + 1).padStart(
        2,
        "0"
      );
      const year = String(payroll_year || new Date().getFullYear());

      console.log("Overtime Period:", { month, year });

      const overtimeQuery = `
        EXEC [dbo].[sp_hrms_employee_overtime_posting] 
          @paymonth = '${month}',
          @payyear = '${year}',
          @empidto = '${empidto || ""}',
          @empidfrom = '${empidfrom || ""}',
          @depidfrom = '${depidfrom || ""}',
          @depidto = '${depidto || ""}',
          @positionidfrom = '${positionidfrom || ""}',
          @positionidto = '${positionidto || ""}',
          @wage = '${wage || ""}'
      `;

      console.log("Executing Overtime SP:", overtimeQuery);

      const overtimeResults = await prisma.$queryRawUnsafe(overtimeQuery);
      console.log("Overtime SP Results Count:", overtimeResults.length);

      overtimeEmployeeIds = overtimeResults
        .map((row) => row.employee_id)
        .filter((id) => id !== null && id !== undefined);

      console.log("Overtime Employee IDs found:", overtimeEmployeeIds.length);
      console.log("Overtime Employee IDs:", overtimeEmployeeIds);

      if (overtimeEmployeeIds.length === 0) {
        console.log("No overtime employees found - returning empty result");
        return {
          data: [],
          currentPage: page,
          size,
          totalPages: 0,
          totalCount: 0,
        };
      }
    } else {
      console.log("Overtime filter NOT applied");
    }

    let advanceComponentIds = [];

    if (is_advance !== undefined && is_advance !== null && is_advance !== "") {
      console.log("Processing ADVANCE filter...");
      console.log("is_advance value:", is_advance);

      const advanceValue =
        is_advance === true || is_advance === "Y" || is_advance === "true"
          ? "Y"
          : "N";

      console.log("Advance filter value:", advanceValue);

      const advanceQuery = `
        SELECT id 
        FROM hrms_m_pay_component 
        WHERE is_advance = '${advanceValue}' AND is_active = 'Y'
      `;

      console.log("Executing Advance Query:", advanceQuery);

      const advanceResults = await prisma.$queryRawUnsafe(advanceQuery);
      console.log("Advance Query Results Count:", advanceResults.length);

      advanceComponentIds = advanceResults
        .map((row) => row.id)
        .filter((id) => id !== null && id !== undefined);

      console.log("Advance Component IDs:", advanceComponentIds);

      if (advanceComponentIds.length === 0) {
        console.log("No advance components found - returning empty result");
        return {
          data: [],
          currentPage: page,
          size,
          totalPages: 0,
          totalCount: 0,
        };
      }
    } else {
      console.log("Advance filter NOT applied");
    }

    let whereConditions = ["1=1"];
    console.log("Building WHERE conditions...");

    if (overtimeEmployeeIds.length > 0) {
      const overtimeCondition = `mp.employee_id IN (${overtimeEmployeeIds.join(
        ","
      )})`;
      whereConditions.push(overtimeCondition);
      console.log("Added overtime condition:", overtimeCondition);
    }

    if (search) {
      const sanitizedSearch = search.replace(/'/g, "''");
      const searchCondition = `
        (e.first_name LIKE '%${sanitizedSearch}%' OR 
         e.last_name LIKE '%${sanitizedSearch}%' OR
         e.employee_code LIKE '%${sanitizedSearch}%' OR
         mp.status LIKE '%${sanitizedSearch}%')
      `;
      whereConditions.push(searchCondition);
      console.log("Added search condition");
    }

    if (payroll_month) {
      const monthCondition = `mp.payroll_month = ${parseInt(payroll_month)}`;
      whereConditions.push(monthCondition);
      console.log("Added month condition:", monthCondition);
    }

    if (payroll_year) {
      const yearCondition = `mp.payroll_year = ${parseInt(payroll_year)}`;
      whereConditions.push(yearCondition);
      console.log("Added year condition:", yearCondition);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const dateCondition = `mp.createdate BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'`;
        whereConditions.push(dateCondition);
        console.log("Added date range condition");
      }
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;
    console.log("Final WHERE clause:", whereClause);

    const dataQuery = `
      SELECT 
        mp.*,
        COALESCE(mp.is_printed, 'N') as is_print,
        e.id as emp_id,
        e.employee_code,
        e.first_name + ' ' + ISNULL(e.last_name, '') as full_name,
        cur.id as currency_id,
        cur.currency_code,
        cur.currency_name
      FROM hrms_d_monthly_payroll_processing mp
      LEFT JOIN hrms_d_employee e ON mp.employee_id = e.id
      LEFT JOIN hrms_m_currency_master cur ON mp.pay_currency = cur.id
      ${whereClause}
      ORDER BY 
        COALESCE(mp.updatedate, '1900-01-01') DESC, 
        COALESCE(mp.createdate, '1900-01-01') DESC
      OFFSET ${skip} ROWS
      FETCH NEXT ${size} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM hrms_d_monthly_payroll_processing mp
      LEFT JOIN hrms_d_employee e ON mp.employee_id = e.id
      ${whereClause}
    `;

    console.log("Executing queries...");

    const data = await prisma.$queryRawUnsafe(dataQuery);
    const countResult = await prisma.$queryRawUnsafe(countQuery);
    const totalCount = Number(countResult[0]?.total) || 0;

    console.log("Data query returned rows:", data.length);
    console.log("Total count:", totalCount);

    const fixedColumns = [
      "id",
      "employee_id",
      "payroll_month",
      "payroll_year",
      "payroll_week",
      "payroll_start_date",
      "payroll_end_date",
      "payroll_paid_days",
      "pay_currency",
      "total_earnings",
      "taxable_earnings",
      "tax_amount",
      "total_deductions",
      "net_pay",
      "status",
      "execution_date",
      "pay_date",
      "doc_date",
      "processed",
      "je_transid",
      "project_id",
      "cost_center1_id",
      "cost_center2_id",
      "cost_center3_id",
      "cost_center4_id",
      "cost_center5_id",
      "approved1",
      "approver1_id",
      "employee_email",
      "remarks",
      "is_print",
      "createdate",
      "createdby",
      "updatedate",
      "updatedby",
      "log_inst",
      "emp_id",
      "employee_code",
      "full_name",
      "currency_id",
      "currency_code",
      "currency_name",
    ];

    const formattedData = data.map((row) => {
      const result = {};

      Object.keys(row).forEach((key) => {
        if (!fixedColumns.includes(key) && /^\d+$/.test(key)) {
          if (advanceComponentIds.length > 0) {
            if (advanceComponentIds.includes(parseInt(key))) {
              result[key] = row[key];
            }
          } else {
            result[key] = row[key];
          }
        }
      });

      result.id = row.id;
      result.employee_id = row.employee_id;
      result.payroll_month = row.payroll_month;
      result.payroll_year = row.payroll_year;
      result.payroll_week = row.payroll_week;
      result.payroll_start_date = row.payroll_start_date;
      result.payroll_end_date = row.payroll_end_date;
      result.payroll_paid_days = row.payroll_paid_days;
      result.pay_currency = row.pay_currency;
      result.total_earnings = row.total_earnings;
      result.taxable_earnings = row.taxable_earnings;
      result.tax_amount = row.tax_amount;
      result.total_deductions = row.total_deductions;
      result.net_pay = row.net_pay;
      result.status = row.status;
      result.execution_date = row.execution_date;
      result.pay_date = row.pay_date;
      result.doc_date = row.doc_date;
      result.processed = row.processed;
      result.je_transid = row.je_transid;
      result.project_id = row.project_id;
      result.cost_center1_id = row.cost_center1_id;
      result.cost_center2_id = row.cost_center2_id;
      result.cost_center3_id = row.cost_center3_id;
      result.cost_center4_id = row.cost_center4_id;
      result.cost_center5_id = row.cost_center5_id;
      result.approved1 = row.approved1;
      result.approver1_id = row.approver1_id;
      result.employee_email = row.employee_email;
      result.remarks = row.remarks;
      result.is_print = row.is_print;
      result.createdate = row.createdate;
      result.createdby = row.createdby;
      result.updatedate = row.updatedate;
      result.updatedby = row.updatedby;
      result.log_inst = row.log_inst;

      result.hrms_monthly_payroll_employee = {
        id: row.emp_id,
        full_name: row.full_name,
        employee_code: row.employee_code,
      };

      result.hrms_monthly_payroll_currency = row.currency_id
        ? {
            id: row.currency_id,
            currency_code: row.currency_code,
            currency_name: row.currency_name,
          }
        : null;

      return result;
    });

    const response = {
      data: formattedData,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };

    console.log("=== getAllMonthlyPayroll END ===");
    console.log("Returning", formattedData.length, "records");

    return response;
  } catch (error) {
    console.error("=== getAllMonthlyPayroll ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw new CustomError("Error retrieving payroll entries", 503);
  }
};
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

const createOrUpdatePayrollBulk = async (rows, user) => {
  const processed = [];

  const safeDate = (val) => {
    if (!val) return "NULL";
    const d = new Date(val);
    return isNaN(d) ? "NULL" : `'${d.toISOString()}'`;
  };

  const safeString = (val) =>
    val ? `'${String(val).replace(/'/g, "''")}'` : "NULL";

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
        pay_currency: safeString(row.Currency),
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
        log_inst: safeString(user?.log_inst),
        createdby: safeNumber(user?.id),
        createdate: "GETDATE()",
        updatedby: safeNumber(user?.id),
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
        let formattedValue = v;
        if (v === undefined || v === null) {
          formattedValue = "NULL";
        } else if (typeof v === "number") {
          formattedValue = v;
        } else if (v === "GETDATE()") {
          formattedValue = "GETDATE()";
        } else if (typeof v === "string") {
          formattedValue = v;
        } else {
          formattedValue = String(v);
        }
        if (k) {
          allCols[`[${k}]`] = formattedValue;
        }
      });

      // Validate that we have at least some columns
      if (Object.keys(allCols).length === 0) {
        throw new Error("No valid columns to insert/update");
      }

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
          .map(([key, val]) => {
            if (val === "GETDATE()") {
              return `${key} = ${val}`;
            } else if (val === "NULL") {
              return `${key} = NULL`;
            } else {
              return `${key} = ${val}`;
            }
          })
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
        const values = Object.values(allCols).join(", ");
        sql = `
          INSERT INTO hrms_d_monthly_payroll_processing (${columns})
          VALUES (${values})
        `;
        action = "inserted";
      }

      // Log SQL for debugging (remove in production if sensitive)
      // console.log("Generated SQL:", sql.substring(0, 500) + "...");

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
      const unpaidLoanEmis = await prisma.hrms_d_loan_emi_schedule.findMany({
        where: {
          employee_id: employee_id,
          due_month: payroll_month?.toString(),
          due_year: payroll_year?.toString(),
          status: "U",
        },
        include: {
          loan_emi_loan_request: {
            include: {
              loan_types: {
                select: {
                  pay_component_id: true,
                  loan_type_pay_component: {
                    select: {
                      component_code: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      for (const unpaidLoanEmi of unpaidLoanEmis) {
        const componentCode =
          unpaidLoanEmi?.loan_emi_loan_request?.loan_types
            ?.loan_type_pay_component?.component_code;

        if (!componentCode) continue;

        let remainingComponentAmount = Number(row?.[componentCode] || 0);

        if (remainingComponentAmount <= 0) continue;

        await prisma.$transaction(async (tx) => {
          const lastPayment = await tx.hrms_d_loan_cash_payment.findFirst({
            where: {
              loan_request_id: unpaidLoanEmi.loan_request_id,
            },
            orderBy: {
              id: "desc",
            },
          });

          const previousPending =
            lastPayment?.pending_amount ?? unpaidLoanEmi.emi_amount;

          // 🔹 Determine payment for this EMI
          const paymentAmount = Math.min(
            remainingComponentAmount,
            unpaidLoanEmi.emi_amount
          );

          const newPending = Math.max(previousPending - paymentAmount, 0);

          // 🔹 Update EMI
          await tx.hrms_d_loan_emi_schedule.update({
            where: { id: unpaidLoanEmi.id },
            data: {
              status: paymentAmount >= unpaidLoanEmi.emi_amount ? "P" : "U",
              emi_amount:
                paymentAmount >= unpaidLoanEmi.emi_amount
                  ? unpaidLoanEmi.emi_amount
                  : unpaidLoanEmi.emi_amount - paymentAmount,
              updatedate: new Date(),
            },
          });

          await tx.hrms_d_loan_cash_payment.create({
            data: {
              loan_request_id: unpaidLoanEmi.loan_request_id,
              amount: paymentAmount,
              balance_amount: previousPending,
              pending_amount: newPending,
              due_year: payroll_year?.toString(),
              log_inst: user?.log_inst || 1,
              createdby: user?.id || 1,
              createdate: new Date(),
            },
          });

          // 🔹 Reduce remaining component amount
          remainingComponentAmount -= paymentAmount;
        });
      }

      // const unpaidLoanEmi = await prisma.hrms_d_loan_emi_schedule.findFirst({
      //   where: {
      //     employee_id: employee_id,
      //     due_month: payroll_month?.toString(),
      //     due_year: payroll_year?.toString(),
      //     status: "U",
      //   },
      //   include: {
      //     loan_emi_loan_request: {
      //       include: {
      //         loan_types: {
      //           select: {
      //             pay_component_id: true,
      //             loan_type_pay_component: {
      //               select: {
      //                 component_code: true,
      //               },
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      // });
      // console.log("Unpaid Loan EMI:", unpaidLoanEmi);

      // if (unpaidLoanEmi) {
      //   const componentCode =
      //     unpaidLoanEmi?.loan_emi_loan_request?.loan_types
      //       ?.loan_type_pay_component?.component_code;

      //   const loanAmount = componentCode
      //     ? Number(row?.[componentCode] || 0)
      //     : 0;
      //   // console.log(
      //   //   "222222222222Unpaid Loan EMI:",
      //   //   componentCode,
      //   //   Number(row?.[componentCode]),
      //   //   loanAmount,
      //   //   unpaidLoanEmi?.loan_emi_loan_request?.loan_types
      //   // );

      //   if (loanAmount > 0) {
      //     await prisma.$transaction(async (tx) => {
      //       const updateEmi = await tx.hrms_d_loan_emi_schedule.update({
      //         where: { id: unpaidLoanEmi.id },
      //         data: {
      //           status: loanAmount >= unpaidLoanEmi.emi_amount ? "P" : "U",
      //           emi_amount:
      //             loanAmount >= unpaidLoanEmi.emi_amount
      //               ? unpaidLoanEmi.emi_amount
      //               : unpaidLoanEmi.emi_amount - loanAmount,
      //           updatedate: new Date(),
      //         },
      //       });

      //       // ✅ 2. GET LAST CASH PAYMENT (FOR BALANCE)
      //       const lastPayment = await tx.hrms_d_loan_cash_payment.findFirst({
      //         where: {
      //           loan_request_id: updateEmi.loan_request_id,
      //         },
      //         orderBy: {
      //           id: "desc",
      //         },
      //       });

      //       const previousPending =
      //         lastPayment?.pending_amount ?? updateEmi.emi_amount;

      //       const newPending = Math.max(previousPending - loanAmount, 0);

      //       // ✅ 3. INSERT LOAN CASH PAYMENT USING COMPONENT VALUE
      //       await tx.hrms_d_loan_cash_payment.create({
      //         data: {
      //           loan_request_id: updateEmi.loan_request_id,
      //           amount: loanAmount, // 🔥 FROM PAY COMPONENT (1009)
      //           balance_amount: previousPending,
      //           pending_amount: newPending,
      //           // due_month: payroll_month,
      //           due_year: payroll_year?.toString(),
      //           log_inst: user?.log_inst || 1,
      //           createdby: user?.id || 1,
      //           createdate: new Date(),
      //         },
      //       });
      //     });
      //   }
      // }
    }

    return processed;
  } catch (error) {
    console.error("Raw payroll error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    throw new Error(
      `Failed to process payroll bulk operation: ${error.message}`
    );
  }
};

const getGeneratedMonthlyPayroll = async (
  search,
  page = 1,
  size = 10,
  employee_id,
  payroll_month,
  payroll_year
) => {
  try {
    page = parseInt(page) || 1;
    size = parseInt(size) || 10;
    const offset = (page - 1) * size;

    let whereClause = `WHERE 1=1`;

    if (employee_id && !isNaN(employee_id) && employee_id !== "") {
      whereClause += ` AND mp.employee_id = ${Number(employee_id)}`;
    }

    if (payroll_month && !isNaN(payroll_month) && payroll_month !== "") {
      whereClause += ` AND mp.payroll_month = ${Number(payroll_month)}`;
    }

    if (payroll_year && !isNaN(payroll_year) && payroll_year !== "") {
      whereClause += ` AND mp.payroll_year = ${Number(payroll_year)}`;
    }

    if (search && search.trim() !== "") {
      const term = search.toLowerCase().replace(/'/g, "''");
      whereClause += `
        AND (
          LOWER(emp.full_name) LIKE '%${term}%'
          OR LOWER(emp.employee_code) LIKE '%${term}%'
          OR LOWER(mp.status) LIKE '%${term}%'
          OR LOWER(mp.remarks) LIKE '%${term}%'
          OR LOWER(mp.employee_email) LIKE '%${term}%'
          OR CAST(mp.payroll_month AS VARCHAR) LIKE '%${term}%'
          OR CAST(mp.payroll_year AS VARCHAR) LIKE '%${term}%'
        )
      `;
    }

    whereClause += ` AND emp.id IS NOT NULL`;

    const query = `
      SELECT 
        mp.*,
        emp.id AS employee_id,
        emp.full_name AS employee_full_name,
        emp.employee_code AS employee_code,
        cur.id AS currency_id,
        cur.currency_code,
        cur.currency_name
      FROM hrms_d_monthly_payroll_processing mp
      INNER JOIN hrms_d_employee emp ON emp.id = mp.employee_id
      LEFT JOIN hrms_m_currency_master cur ON cur.id = mp.pay_currency
      ${whereClause}
      ORDER BY mp.updatedate DESC, mp.payroll_year DESC, mp.payroll_month DESC
      OFFSET ${offset} ROWS FETCH NEXT ${size} ROWS ONLY;
    `;

    console.log("Generated Query:", query);

    const rawData = await prisma.$queryRawUnsafe(query);

    const data = rawData.map((row) => {
      const {
        employee_id,
        employee_full_name,
        employee_code,
        currency_id,
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
          id: currency_id,
          currency_code,
          currency_name,
        },
      };
    });

    const countQuery = `
      SELECT COUNT(*) AS count
      FROM hrms_d_monthly_payroll_processing mp
      INNER JOIN hrms_d_employee emp ON emp.id = mp.employee_id
      LEFT JOIN hrms_m_currency_master cur ON cur.id = mp.pay_currency
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
      filters: {
        employee_id: employee_id || null,
        payroll_month: payroll_month || null,
        payroll_year: payroll_year || null,
        search: search || null,
      },
    };
  } catch (error) {
    console.error("Payroll retrieval error", error);
    throw new Error("Error retrieving payroll entries");
  }
};

const downloadPayslipPDF = async (employee_id, payroll_month, payroll_year) => {
  try {
    const payroll = await prisma.$queryRawUnsafe(`
      SELECT 
        mp.*,  
        emp.full_name,
        emp.employee_code AS pf_hr_id,
        emp.account_number AS bank_account,
        emp.join_date AS engagement_date,
        emp.national_id_number AS nrc_no,
        emp.identification_number AS tpin_no,
        emp.cost_center_id AS cost_center,
        emp.email AS employee_email,
        emp.bank_id,
        emp.payment_mode,
        d.designation_name AS designation,
        b.bank_name AS bank_name,
        cur.currency_name AS currency_name,
        cur.currency_code AS currency_code
      FROM hrms_d_monthly_payroll_processing mp
      LEFT JOIN hrms_d_employee emp ON emp.id = mp.employee_id
      LEFT JOIN hrms_m_designation_master d ON d.id = emp.designation_id
      LEFT JOIN hrms_m_bank_master b ON b.id = emp.bank_id
      LEFT JOIN hrms_m_currency_master cur ON cur.id = mp.pay_currency
      WHERE mp.employee_id = ${Number(employee_id)}
        AND mp.payroll_month = ${Number(payroll_month)}
        AND mp.payroll_year = ${Number(payroll_year)}
    `);

    if (!payroll || payroll.length === 0) {
      throw new CustomError(
        `No payroll record found for employee ${employee_id}, month ${payroll_month}, year ${payroll_year}`,
        404
      );
    }

    const record = payroll[0];

    const result = await prisma.$queryRawUnsafe(`
      SELECT * FROM vw_hrms_get_component_names
    `);

    const componentCodeToName = {};
    const componentCodeToPayType = {};

    if (result && Array.isArray(result)) {
      result.forEach((component) => {
        if (component.component_code && component.component_name) {
          componentCodeToName[component.component_code] =
            component.component_name;
          componentCodeToPayType[component.component_code] =
            component.pay_or_deduct;
        }
      });
    }

    const numericKeys = [];
    for (const key in record) {
      if (/^\d+$/.test(key)) {
        numericKeys.push({ key, value: record[key], type: typeof record[key] });
      }
    }

    const earnings = [];
    const deductions = [];

    for (const key in record) {
      if (/^\d+$/.test(key)) {
        const value = record[key];

        if (value !== null && value !== 0 && value !== "0.00") {
          const label = componentCodeToName[key] || key;
          const payType = componentCodeToPayType[key];

          if (payType === "P" && Number(value) !== 0) {
            earnings.push({ label, amount: Number(value) });
          } else if (payType === "D" && Number(value) !== 0) {
            deductions.push({ label, amount: Number(value) });
          }
        }
      }
    }
    const reqData = await prisma.hrms_d_default_configurations.findFirst({
      select: {
        company_logo: true,
        company_signature: true,
      },
    });

    return {
      ...record,
      pf_hr_id: record.pf_hr_id || "",
      full_name: record.full_name || "",
      designation: record.designation || "",
      location: record.location || "",
      cost_center: record.cost_center || "",
      napsa_no: record.napsa_no || "",
      tpin_no: record.tpin_no || "",
      nrc_no: record.nrc_no || "",
      nhis_no: record.nhis_no || "",
      engagement_date: record.engagement_date || "",
      bank_account: record.bank_account || "********",
      bank_name: record.bank_name || "NMB",
      earnings,
      deductions,
      company_logo: reqData?.company_logo || "",
      company_signature: reqData?.company_signature || "",
    };
  } catch (error) {
    console.error("Raw payslip fetch error:", error);
    throw new CustomError("Error fetching payslip data", 500);
  }
};

const getPayrollDataForExcel = async (
  search,
  employee_id,
  payroll_month,
  payroll_year
) => {
  try {
    let whereClause = `WHERE 1=1`;

    if (employee_id && !isNaN(employee_id) && employee_id !== "") {
      whereClause += ` AND mp.employee_id = ${Number(employee_id)}`;
    }

    if (payroll_month && !isNaN(payroll_month) && payroll_month !== "") {
      whereClause += ` AND mp.payroll_month = ${Number(payroll_month)}`;
    }

    if (payroll_year && !isNaN(payroll_year) && payroll_year !== "") {
      whereClause += ` AND mp.payroll_year = ${Number(payroll_year)}`;
    }

    if (search && search.trim() !== "") {
      const term = search.toLowerCase().replace(/'/g, "''");
      whereClause += `
        AND (
          LOWER(emp.full_name) LIKE '%${term}%'
          OR LOWER(emp.employee_code) LIKE '%${term}%'
          OR LOWER(mp.status) LIKE '%${term}%'
          OR LOWER(mp.remarks) LIKE '%${term}%'
          OR LOWER(mp.employee_email) LIKE '%${term}%'
          OR CAST(mp.payroll_month AS VARCHAR) LIKE '%${term}%'
          OR CAST(mp.payroll_year AS VARCHAR) LIKE '%${term}%'
        )
      `;
    }

    whereClause += ` AND emp.id IS NOT NULL`;

    const query = `
      SELECT
        mp.*,
        emp.id AS emp_id,
        emp.full_name AS employee_full_name,
        emp.employee_code AS employee_code,
        emp.national_id_number AS nrc_no,
        emp.identification_number AS tpin_no,
        emp.join_date,
        emp.email AS emp_email,
        cur.id AS currency_id,
        cur.currency_code,
        cur.currency_name,
        d.designation_name AS designation,
        dept.department_name AS department,
        b.bank_name AS bank_name
      FROM hrms_d_monthly_payroll_processing mp
      INNER JOIN hrms_d_employee emp ON emp.id = mp.employee_id
      LEFT JOIN hrms_m_currency_master cur ON cur.id = mp.pay_currency
      LEFT JOIN hrms_m_designation_master d ON d.id = emp.designation_id
      LEFT JOIN hrms_m_department_master dept ON dept.id = emp.department_id
      LEFT JOIN hrms_m_bank_master b ON b.id = emp.bank_id

      ${whereClause}
      ORDER BY mp.updatedate DESC, mp.payroll_year DESC, mp.payroll_month DESC;
    `;

    console.log("Excel Query:", query);

    const rawData = await prisma.$queryRawUnsafe(query);

    const componentResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM vw_hrms_get_component_names ORDER BY component_code
    `);

    const componentCodeToName = {};
    const componentCodeToPayType = {};
    const earningsComponents = [];
    const deductionComponents = [];

    if (componentResult && Array.isArray(componentResult)) {
      componentResult.forEach((component) => {
        if (component.component_code && component.component_name) {
          componentCodeToName[component.component_code] =
            component.component_name;
          componentCodeToPayType[component.component_code] =
            component.pay_or_deduct;

          if (component.pay_or_deduct === "P") {
            earningsComponents.push(component.component_code);
          } else if (component.pay_or_deduct === "D") {
            deductionComponents.push(component.component_code);
          }
        }
      });
    }

    const processedData = rawData.map((row) => {
      const processedRow = {
        employee_code: row.employee_code,
        employee_full_name: row.employee_full_name,
        designation: row.designation || "",
        department: row.department || "",
        join_date: row.join_date ? new Date(row.join_date) : null,
        tpin_no: row.tpin_no || "",
        employee_email: row.emp_email || "",
        payroll_month: row.payroll_month,
        payroll_year: row.payroll_year,
        payroll_week: row.payroll_week || 0,
        payroll_start_date: row.payroll_start_date
          ? new Date(row.payroll_start_date)
          : null,
        payroll_end_date: row.payroll_end_date
          ? new Date(row.payroll_end_date)
          : null,
        payroll_paid_days: row.payroll_paid_days || 0,

        currency_code: row.currency_code || "",
        currency_name: row.currency_name || "",

        basic_salary: Number(row.basic_salary) || 0,
        total_earnings: Number(row.total_earnings) || 0,
        taxable_earnings: Number(row.taxable_earnings) || 0,
        tax_amount: Number(row.tax_amount) || 0,
        total_deductions: Number(row.total_deductions) || 0,
        net_pay: Number(row.net_pay) || 0,

        status: row.status || "",
        processed: row.processed || "N",
        execution_date: row.execution_date
          ? new Date(row.execution_date)
          : null,
        pay_date: row.pay_date ? new Date(row.pay_date) : null,
        doc_date: row.doc_date ? new Date(row.doc_date) : null,
        processed_on: row.processed_on ? new Date(row.processed_on) : null,

        approved1: row.approved1 || "N",
        approver1_id: row.approver1_id || "",

        project_id: row.project_id || "",

        je_transid: row.je_transid || "",
        remarks: row.remarks || "",

        createdby: row.createdby || "",
        createdate: row.createdate ? new Date(row.createdate) : null,
        updatedby: row.updatedby || "",
        updatedate: row.updatedate ? new Date(row.updatedate) : null,
        log_inst: row.log_inst || "",
      };

      [...earningsComponents, ...deductionComponents].forEach(
        (componentCode) => {
          const value = Number(row[componentCode]) || 0;
          const componentName =
            componentCodeToName[componentCode] || `Component_${componentCode}`;
          processedRow[`${componentName} (${componentCode})`] = value;
        }
      );

      return processedRow;
    });

    return {
      data: processedData,
      componentMapping: componentCodeToName,
      earningsComponents,
      deductionComponents,
      totalRecords: processedData.length,
    };
  } catch (error) {
    console.error("Excel data retrieval error", error);
    throw new CustomError(
      `Error retrieving payroll data for Excel export: ${error.message}`,
      500
    );
  }
};

const getAllMonthlyPayrollsForBulkDownload = async (
  filters = {},
  tenantDb = null
) => {
  try {
    let dbClient;

    if (tenantDb) {
      dbClient = getPrismaClient(tenantDb);
    } else {
      const store = asyncLocalStorage.getStore();
      if (store && store.tenantDb) {
        dbClient = prisma;
      } else {
        dbClient = prisma;
      }
    }

    let whereConditions = ["1=1"];
    if (filters.payslip_ids) {
      const validIds = filters.payslip_ids.filter((id) => id && !isNaN(id));
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`mp.id IN (${idList})`);
      }
    }
    if (filters.employee_ids) {
      const validIds = filters.employee_ids.filter((id) => id && !isNaN(id));
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`mp.employee_id IN (${idList})`);
      }
    } else if (filters.employee_id) {
      if (filters.employee_id.gte && filters.employee_id.lte) {
        whereConditions.push(
          `mp.employee_id BETWEEN ${Number(
            filters.employee_id.gte
          )} AND ${Number(filters.employee_id.lte)}`
        );
      } else if (filters.employee_id.gte) {
        whereConditions.push(
          `mp.employee_id >= ${Number(filters.employee_id.gte)}`
        );
      } else if (filters.employee_id.lte) {
        whereConditions.push(
          `mp.employee_id <= ${Number(filters.employee_id.lte)}`
        );
      }
    }

    if (filters.payroll_month) {
      if (filters.payroll_month.gte && filters.payroll_month.lte) {
        whereConditions.push(
          `mp.payroll_month BETWEEN ${Number(
            filters.payroll_month.gte
          )} AND ${Number(filters.payroll_month.lte)}`
        );
      } else if (filters.payroll_month.gte) {
        whereConditions.push(
          `mp.payroll_month >= ${Number(filters.payroll_month.gte)}`
        );
      } else if (filters.payroll_month.lte) {
        whereConditions.push(
          `mp.payroll_month <= ${Number(filters.payroll_month.lte)}`
        );
      }
    }

    if (filters.payroll_year) {
      if (filters.payroll_year.gte && filters.payroll_year.lte) {
        whereConditions.push(
          `mp.payroll_year BETWEEN ${Number(
            filters.payroll_year.gte
          )} AND ${Number(filters.payroll_year.lte)}`
        );
      } else if (filters.payroll_year.gte) {
        whereConditions.push(
          `mp.payroll_year >= ${Number(filters.payroll_year.gte)}`
        );
      } else if (filters.payroll_year.lte) {
        whereConditions.push(
          `mp.payroll_year <= ${Number(filters.payroll_year.lte)}`
        );
      }
    }

    if (filters.status) {
      const escapedStatus = filters.status.replace(/'/g, "''");
      whereConditions.push(`mp.status = '${escapedStatus}'`);
    }

    const whereClause = whereConditions.join(" AND ");

    const query = `
      SELECT 
        mp.id,
        mp.employee_id,
        mp.payroll_month,
        mp.payroll_year,
        mp.payroll_week,
        mp.payroll_start_date,
        mp.payroll_end_date,
        mp.payroll_paid_days,
        mp.pay_currency,
        mp.total_earnings,
        mp.taxable_earnings,
        mp.tax_amount,
        mp.total_deductions,
        mp.net_pay,
        mp.status,
        mp.execution_date,
        mp.pay_date,
        mp.doc_date,
        mp.processed,
        mp.je_transid,
        mp.project_id,
        mp.cost_center1_id,
        mp.cost_center2_id,
        mp.cost_center3_id,
        mp.cost_center4_id,
        mp.cost_center5_id,
        mp.approved1,
        mp.approver1_id,
        mp.employee_email,
        mp.remarks,
        mp.createdate,
        mp.updatedate,
        e.id as emp_id,
        e.employee_code,
        e.full_name,
        e.email as emp_email,
        e.phone_number as phone,
        e.department_id,
        e.designation_id,
        cur.id as currency_id,
        cur.currency_code,
        cur.currency_name
      FROM hrms_d_monthly_payroll_processing mp
      LEFT JOIN hrms_d_employee e ON mp.employee_id = e.id
      LEFT JOIN hrms_m_currency_master cur ON mp.pay_currency = cur.id
      WHERE ${whereClause}
      ORDER BY mp.createdate DESC
    `;

    const monthlyPayrolls = await dbClient.$queryRawUnsafe(query);

    const formattedResults = monthlyPayrolls.map((row) => ({
      id: row.id,
      employee_id: row.employee_id,
      payroll_month: row.payroll_month,
      payroll_year: row.payroll_year,
      payroll_week: row.payroll_week,
      payroll_start_date: row.payroll_start_date,
      payroll_end_date: row.payroll_end_date,
      payroll_paid_days: row.payroll_paid_days,
      pay_currency: row.pay_currency,
      total_earnings: row.total_earnings,
      taxable_earnings: row.taxable_earnings,
      tax_amount: row.tax_amount,
      total_deductions: row.total_deductions,
      net_pay: row.net_pay,
      status: row.status,
      execution_date: row.execution_date,
      pay_date: row.pay_date,
      doc_date: row.doc_date,
      processed: row.processed,
      je_transid: row.je_transid,
      project_id: row.project_id,
      cost_center1_id: row.cost_center1_id,
      cost_center2_id: row.cost_center2_id,
      cost_center3_id: row.cost_center3_id,
      cost_center4_id: row.cost_center4_id,
      cost_center5_id: row.cost_center5_id,
      approved1: row.approved1,
      approver1_id: row.approver1_id,
      employee_email: row.employee_email,
      remarks: row.remarks,
      createdate: row.createdate,
      updatedate: row.updatedate,
      hrms_monthly_payroll_employee: row.emp_id
        ? {
            id: row.emp_id,
            full_name: row.full_name,
            employee_code: row.employee_code,
            email: row.emp_email,
            phone: row.phone,
            department_id: row.department_id,
            designation_id: row.designation_id,
          }
        : null,
      hrms_monthly_payroll_currency: row.currency_id
        ? {
            id: row.currency_id,
            currency_code: row.currency_code,
            currency_name: row.currency_name,
          }
        : null,
    }));

    return formattedResults;
  } catch (error) {
    console.error("Error in getAllMonthlyPayrollsForBulkDownload:", error);
    throw new CustomError(error.message, 500);
  }
};

const getMonthlyPayrollCountForBulkDownload = async (
  filters = {},
  tenantDb = null
) => {
  try {
    let dbClient;

    if (tenantDb) {
      dbClient = getPrismaClient(tenantDb);
    } else {
      const store = asyncLocalStorage.getStore();
      if (store && store.tenantDb) {
        dbClient = prisma;
      } else {
        dbClient = prisma;
      }
    }

    let whereConditions = ["1=1"];
    if (filters.payslip_ids) {
      const validIds = filters.payslip_ids.filter((id) => id && !isNaN(id));
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`mp.id IN (${idList})`);
      }
    }
    if (filters.employee_ids) {
      const validIds = filters.employee_ids.filter((id) => id && !isNaN(id));
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`mp.employee_id IN (${idList})`);
      }
    } else if (filters.employee_id) {
      if (filters.employee_id.gte && filters.employee_id.lte) {
        whereConditions.push(
          `mp.employee_id BETWEEN ${Number(
            filters.employee_id.gte
          )} AND ${Number(filters.employee_id.lte)}`
        );
      } else if (filters.employee_id.gte) {
        whereConditions.push(
          `mp.employee_id >= ${Number(filters.employee_id.gte)}`
        );
      } else if (filters.employee_id.lte) {
        whereConditions.push(
          `mp.employee_id <= ${Number(filters.employee_id.lte)}`
        );
      }
    }

    if (filters.payroll_month) {
      if (filters.payroll_month.gte && filters.payroll_month.lte) {
        whereConditions.push(
          `mp.payroll_month BETWEEN ${Number(
            filters.payroll_month.gte
          )} AND ${Number(filters.payroll_month.lte)}`
        );
      } else if (filters.payroll_month.gte) {
        whereConditions.push(
          `mp.payroll_month >= ${Number(filters.payroll_month.gte)}`
        );
      } else if (filters.payroll_month.lte) {
        whereConditions.push(
          `mp.payroll_month <= ${Number(filters.payroll_month.lte)}`
        );
      }
    }

    if (filters.payroll_year) {
      if (filters.payroll_year.gte && filters.payroll_year.lte) {
        whereConditions.push(
          `mp.payroll_year BETWEEN ${Number(
            filters.payroll_year.gte
          )} AND ${Number(filters.payroll_year.lte)}`
        );
      } else if (filters.payroll_year.gte) {
        whereConditions.push(
          `mp.payroll_year >= ${Number(filters.payroll_year.gte)}`
        );
      } else if (filters.payroll_year.lte) {
        whereConditions.push(
          `mp.payroll_year <= ${Number(filters.payroll_year.lte)}`
        );
      }
    }

    if (filters.status) {
      const escapedStatus = filters.status.replace(/'/g, "''");
      whereConditions.push(`mp.status = '${escapedStatus}'`);
    }

    const whereClause = whereConditions.join(" AND ");

    const countQuery = `
      SELECT COUNT(*) as total
      FROM hrms_d_monthly_payroll_processing mp
      WHERE ${whereClause}
    `;

    const result = await dbClient.$queryRawUnsafe(countQuery);
    return Number(result[0]?.total) || 0;
  } catch (error) {
    console.error("Error in getMonthlyPayrollCountForBulkDownload:", error);
    throw new CustomError(error.message, 500);
  }
};

const getMonthlyPayrollsPaginatedForBulkDownload = async (
  filters = {},
  offset = 0,
  limit = 1000,
  tenantDb = null
) => {
  try {
    let dbClient;

    if (tenantDb) {
      dbClient = getPrismaClient(tenantDb);
    } else {
      const store = asyncLocalStorage.getStore();
      if (store && store.tenantDb) {
        dbClient = prisma;
      } else {
        dbClient = prisma;
      }
    }

    let whereConditions = ["1=1"];

    if (filters.payslip_ids) {
      const validIds = filters.payslip_ids.filter((id) => id && !isNaN(id));
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`mp.id IN (${idList})`);
      }
    }

    if (filters.employee_ids) {
      const validIds = filters.employee_ids.filter((id) => id && !isNaN(id));
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`mp.employee_id IN (${idList})`);
      }
    } else if (filters.employee_id) {
      if (filters.employee_id.gte && filters.employee_id.lte) {
        whereConditions.push(
          `mp.employee_id BETWEEN ${Number(
            filters.employee_id.gte
          )} AND ${Number(filters.employee_id.lte)}`
        );
      } else if (filters.employee_id.gte) {
        whereConditions.push(
          `mp.employee_id >= ${Number(filters.employee_id.gte)}`
        );
      } else if (filters.employee_id.lte) {
        whereConditions.push(
          `mp.employee_id <= ${Number(filters.employee_id.lte)}`
        );
      }
    }

    if (filters.payroll_month) {
      if (filters.payroll_month.gte && filters.payroll_month.lte) {
        whereConditions.push(
          `mp.payroll_month BETWEEN ${Number(
            filters.payroll_month.gte
          )} AND ${Number(filters.payroll_month.lte)}`
        );
      } else if (filters.payroll_month.gte) {
        whereConditions.push(
          `mp.payroll_month >= ${Number(filters.payroll_month.gte)}`
        );
      } else if (filters.payroll_month.lte) {
        whereConditions.push(
          `mp.payroll_month <= ${Number(filters.payroll_month.lte)}`
        );
      }
    }

    if (filters.payroll_year) {
      if (filters.payroll_year.gte && filters.payroll_year.lte) {
        whereConditions.push(
          `mp.payroll_year BETWEEN ${Number(
            filters.payroll_year.gte
          )} AND ${Number(filters.payroll_year.lte)}`
        );
      } else if (filters.payroll_year.gte) {
        whereConditions.push(
          `mp.payroll_year >= ${Number(filters.payroll_year.gte)}`
        );
      } else if (filters.payroll_year.lte) {
        whereConditions.push(
          `mp.payroll_year <= ${Number(filters.payroll_year.lte)}`
        );
      }
    }

    if (filters.status) {
      const escapedStatus = filters.status.replace(/'/g, "''");
      whereConditions.push(`mp.status = '${escapedStatus}'`);
    }

    const whereClause = whereConditions.join(" AND ");

    const query = `
      SELECT 
        mp.id,
        mp.employee_id,
        mp.payroll_month,
        mp.payroll_year,
        mp.payroll_week,
        mp.payroll_start_date,
        mp.payroll_end_date,
        mp.payroll_paid_days,
        mp.pay_currency,
        mp.total_earnings,
        mp.taxable_earnings,
        mp.tax_amount,
        mp.total_deductions,
        mp.net_pay,
        mp.status,
        mp.execution_date,
        mp.pay_date,
        mp.doc_date,
        mp.processed,
        mp.je_transid,
        mp.project_id,
        mp.cost_center1_id,
        mp.cost_center2_id,
        mp.cost_center3_id,
        mp.cost_center4_id,
        mp.cost_center5_id,
        mp.approved1,
        mp.approver1_id,
        mp.employee_email,
        mp.remarks,
        mp.createdate,
        mp.updatedate,
        e.id as emp_id,
        e.employee_code,
        e.full_name,
        e.email as emp_email,
        e.phone_number as phone,
        e.department_id,
        e.designation_id,
        cur.id as currency_id,
        cur.currency_code,
        cur.currency_name
      FROM hrms_d_monthly_payroll_processing mp
      LEFT JOIN hrms_d_employee e ON mp.employee_id = e.id
      LEFT JOIN hrms_m_currency_master cur ON mp.pay_currency = cur.id
      WHERE ${whereClause}
      ORDER BY mp.createdate DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `;

    const monthlyPayrolls = await dbClient.$queryRawUnsafe(query);

    const formattedResults = monthlyPayrolls.map((row) => ({
      id: row.id,
      employee_id: row.employee_id,
      payroll_month: row.payroll_month,
      payroll_year: row.payroll_year,
      payroll_week: row.payroll_week,
      payroll_start_date: row.payroll_start_date,
      payroll_end_date: row.payroll_end_date,
      payroll_paid_days: row.payroll_paid_days,
      pay_currency: row.pay_currency,
      total_earnings: row.total_earnings,
      taxable_earnings: row.taxable_earnings,
      tax_amount: row.tax_amount,
      total_deductions: row.total_deductions,
      net_pay: row.net_pay,
      status: row.status,
      execution_date: row.execution_date,
      pay_date: row.pay_date,
      doc_date: row.doc_date,
      processed: row.processed,
      je_transid: row.je_transid,
      project_id: row.project_id,
      cost_center1_id: row.cost_center1_id,
      cost_center2_id: row.cost_center2_id,
      cost_center3_id: row.cost_center3_id,
      cost_center4_id: row.cost_center4_id,
      cost_center5_id: row.cost_center5_id,
      approved1: row.approved1,
      approver1_id: row.approver1_id,
      employee_email: row.employee_email,
      remarks: row.remarks,
      createdate: row.createdate,
      updatedate: row.updatedate,
      hrms_monthly_payroll_employee: row.emp_id
        ? {
            id: row.emp_id,
            full_name: row.full_name,
            employee_code: row.employee_code,
            email: row.emp_email,
            phone: row.phone,
            department_id: row.department_id,
            designation_id: row.designation_id,
          }
        : null,
      hrms_monthly_payroll_currency: row.currency_id
        ? {
            id: row.currency_id,
            currency_code: row.currency_code,
            currency_name: row.currency_name,
          }
        : null,
    }));

    return formattedResults;
  } catch (error) {
    console.error(
      "Error in getMonthlyPayrollsPaginatedForBulkDownload:",
      error
    );
    throw new CustomError(error.message, 500);
  }
};

const checkIndividualPayslipDownloaded = async (
  employee_id,
  payroll_month,
  payroll_year,
  tenantDb = null
) => {
  let dbClient;
  if (tenantDb) {
    dbClient = getPrismaClient(tenantDb);
  } else {
    const store = asyncLocalStorage.getStore();
    if (store && store.tenantDb) {
      dbClient = prisma;
    } else {
      dbClient = prisma;
    }
  }

  try {
    const query = `
      SELECT 
        mp.employee_id,
        mp.payroll_month,
        mp.email,
        mp.payroll_year,
        mp.is_printed,
        e.full_name,
        e.employee_code,
        e.log_inst,
        FORMAT(mp.updatedate, 'yyyy-MM-dd HH:mm:ss') as download_date,
        mp.updatedby as downloaded_by
      FROM hrms_d_monthly_payroll_processing mp
      LEFT JOIN hrms_d_employee e ON mp.employee_id = e.id
      WHERE mp.employee_id = ${Number(employee_id)}
        AND mp.payroll_month = ${Number(payroll_month)}
        AND mp.payroll_year = ${Number(payroll_year)}
        AND mp.is_printed = 'Y'
    `;

    const result = await dbClient.$queryRawUnsafe(query);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error checking individual payslip download status:", error);
    return null;
  }
};

const markIndividualPayslipAsPrinted = async (
  employee_id,
  payroll_month,
  payroll_year,
  userId,
  tenantDb = null
) => {
  let dbClient;
  if (tenantDb) {
    dbClient = getPrismaClient(tenantDb);
  } else {
    const store = asyncLocalStorage.getStore();
    if (store && store.tenantDb) {
      dbClient = prisma;
    } else {
      dbClient = prisma;
    }
  }

  try {
    const updateQuery = `
      UPDATE hrms_d_monthly_payroll_processing 
      SET is_printed = 'Y', 
          updatedate = GETDATE(),
          updatedby = ${userId}
      WHERE employee_id = ${Number(employee_id)}
        AND payroll_month = ${Number(payroll_month)}
        AND payroll_year = ${Number(payroll_year)}
        AND (is_printed IS NULL OR is_printed = 'N')
    `;

    const result = await dbClient.$executeRawUnsafe(updateQuery);

    console.log(
      `Marked individual payslip as printed: Employee ${employee_id}, ${payroll_month}/${payroll_year}`
    );
    return result;
  } catch (error) {
    console.error("Error marking individual payslip as printed:", error);
    throw error;
  }
};

const checkAlreadyDownloadedPayrolls = async (filters, tenantDb = null) => {
  let dbClient;
  if (tenantDb) {
    dbClient = getPrismaClient(tenantDb);
  } else {
    const store = asyncLocalStorage.getStore();
    if (store && store.tenantDb) {
      dbClient = prisma;
    } else {
      dbClient = prisma;
    }
  }

  try {
    console.log(
      "checkAlreadyDownloadedPayrolls - Filters:",
      JSON.stringify(filters, null, 2)
    );
    console.log("checkAlreadyDownloadedPayrolls - TenantDb:", tenantDb);

    let whereConditions = ["is_printed = 'Y'"];

    if (filters.employee_ids) {
      const validIds = filters.employee_ids.filter((id) => id && !isNaN(id));
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`employee_id IN (${idList})`);
        console.log(
          `checkAlreadyDownloadedPayrolls - Employee IDs filter: ${idList}`
        );
      }
    } else if (filters.employee_id) {
      if (filters.employee_id.gte && filters.employee_id.lte) {
        whereConditions.push(
          `employee_id BETWEEN ${Number(filters.employee_id.gte)} AND ${Number(
            filters.employee_id.lte
          )}`
        );
        console.log(
          `checkAlreadyDownloadedPayrolls - Employee range filter: ${filters.employee_id.gte} to ${filters.employee_id.lte}`
        );
      } else if (filters.employee_id.gte) {
        whereConditions.push(
          `employee_id >= ${Number(filters.employee_id.gte)}`
        );
        console.log(
          `checkAlreadyDownloadedPayrolls - Employee from filter: ${filters.employee_id.gte}`
        );
      } else if (filters.employee_id.lte) {
        whereConditions.push(
          `employee_id <= ${Number(filters.employee_id.lte)}`
        );
        console.log(
          `checkAlreadyDownloadedPayrolls - Employee to filter: ${filters.employee_id.lte}`
        );
      }
    }

    if (filters.payroll_month) {
      if (filters.payroll_month.gte && filters.payroll_month.lte) {
        whereConditions.push(
          `payroll_month BETWEEN ${Number(
            filters.payroll_month.gte
          )} AND ${Number(filters.payroll_month.lte)}`
        );
        console.log(
          `checkAlreadyDownloadedPayrolls - Month range filter: ${filters.payroll_month.gte} to ${filters.payroll_month.lte}`
        );
      } else if (filters.payroll_month.gte) {
        whereConditions.push(
          `payroll_month >= ${Number(filters.payroll_month.gte)}`
        );
        console.log(
          `checkAlreadyDownloadedPayrolls - Month from filter: ${filters.payroll_month.gte}`
        );
      } else if (filters.payroll_month.lte) {
        whereConditions.push(
          `payroll_month <= ${Number(filters.payroll_month.lte)}`
        );
        console.log(
          `checkAlreadyDownloadedPayrolls - Month to filter: ${filters.payroll_month.lte}`
        );
      }
    }

    if (filters.payroll_year) {
      if (filters.payroll_year.gte && filters.payroll_year.lte) {
        whereConditions.push(
          `payroll_year BETWEEN ${Number(
            filters.payroll_year.gte
          )} AND ${Number(filters.payroll_year.lte)}`
        );
        console.log(
          `checkAlreadyDownloadedPayrolls - Year range filter: ${filters.payroll_year.gte} to ${filters.payroll_year.lte}`
        );
      } else if (filters.payroll_year.gte) {
        whereConditions.push(
          `payroll_year >= ${Number(filters.payroll_year.gte)}`
        );
        console.log(
          `checkAlreadyDownloadedPayrolls - Year from filter: ${filters.payroll_year.gte}`
        );
      } else if (filters.payroll_year.lte) {
        whereConditions.push(
          `payroll_year <= ${Number(filters.payroll_year.lte)}`
        );
        console.log(
          `checkAlreadyDownloadedPayrolls - Year to filter: ${filters.payroll_year.lte}`
        );
      }
    }

    if (filters.status) {
      const escapedStatus = filters.status.replace(/'/g, "''");
      whereConditions.push(`status = '${escapedStatus}'`);
      console.log(
        `checkAlreadyDownloadedPayrolls - Status filter: ${escapedStatus}`
      );
    }

    const whereClause = whereConditions.join(" AND ");
    console.log(
      `checkAlreadyDownloadedPayrolls - Final WHERE clause: ${whereClause}`
    );

    const query = `
      SELECT 
        employee_id,
        payroll_month,
        payroll_year,
        full_name,
        employee_code,
        FORMAT(mp.updatedate, 'yyyy-MM-dd HH:mm:ss') as download_date,
        mp.updatedby as downloaded_by
      FROM hrms_d_monthly_payroll_processing mp
      LEFT JOIN hrms_d_employee e ON mp.employee_id = e.id
      WHERE ${whereClause}
      ORDER BY mp.updatedate DESC
    `;

    console.log(`checkAlreadyDownloadedPayrolls - Executing query: ${query}`);

    const downloadedPayrolls = await dbClient.$queryRawUnsafe(query);

    console.log(
      `checkAlreadyDownloadedPayrolls - Found ${downloadedPayrolls.length} downloaded payrolls`
    );

    return downloadedPayrolls;
  } catch (error) {
    console.error("Error checking downloaded payrolls:", error);
    return [];
  }
};

const getDownloadStatistics = async (filters, tenantDb = null) => {
  let dbClient;
  if (tenantDb) {
    dbClient = getPrismaClient(tenantDb);
  } else {
    const store = asyncLocalStorage.getStore();
    if (store && store.tenantDb) {
      dbClient = prisma;
    } else {
      dbClient = prisma;
    }
  }

  try {
    let whereConditions = ["1=1"];

    if (filters.employee_ids) {
      const validIds = filters.employee_ids.filter((id) => id && !isNaN(id));
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`employee_id IN (${idList})`);
      }
    } else if (filters.employee_id) {
      if (filters.employee_id.gte && filters.employee_id.lte) {
        whereConditions.push(
          `employee_id BETWEEN ${Number(filters.employee_id.gte)} AND ${Number(
            filters.employee_id.lte
          )}`
        );
      } else if (filters.employee_id.gte) {
        whereConditions.push(
          `employee_id >= ${Number(filters.employee_id.gte)}`
        );
      } else if (filters.employee_id.lte) {
        whereConditions.push(
          `employee_id <= ${Number(filters.employee_id.lte)}`
        );
      }
    }

    if (filters.payroll_month) {
      if (filters.payroll_month.gte && filters.payroll_month.lte) {
        whereConditions.push(
          `payroll_month BETWEEN ${Number(
            filters.payroll_month.gte
          )} AND ${Number(filters.payroll_month.lte)}`
        );
      } else if (filters.payroll_month.gte) {
        whereConditions.push(
          `payroll_month >= ${Number(filters.payroll_month.gte)}`
        );
      } else if (filters.payroll_month.lte) {
        whereConditions.push(
          `payroll_month <= ${Number(filters.payroll_month.lte)}`
        );
      }
    }

    if (filters.payroll_year) {
      if (filters.payroll_year.gte && filters.payroll_year.lte) {
        whereConditions.push(
          `payroll_year BETWEEN ${Number(
            filters.payroll_year.gte
          )} AND ${Number(filters.payroll_year.lte)}`
        );
      } else if (filters.payroll_year.gte) {
        whereConditions.push(
          `payroll_year >= ${Number(filters.payroll_year.gte)}`
        );
      } else if (filters.payroll_year.lte) {
        whereConditions.push(
          `payroll_year <= ${Number(filters.payroll_year.lte)}`
        );
      }
    }

    if (filters.status) {
      const escapedStatus = filters.status.replace(/'/g, "''");
      whereConditions.push(`status = '${escapedStatus}'`);
    }

    const whereClause = whereConditions.join(" AND ");

    const statsQuery = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN is_printed = 'Y' THEN 1 END) as downloaded_records,
        COUNT(CASE WHEN is_printed IS NULL OR is_printed = 'N' THEN 1 END) as not_downloaded_records
      FROM hrms_d_monthly_payroll_processing
      WHERE ${whereClause}
    `;

    const stats = await dbClient.$queryRawUnsafe(statsQuery);

    return stats[0];
  } catch (error) {
    console.error("Error getting download statistics:", error);
    return {
      total_records: 0,
      downloaded_records: 0,
      not_downloaded_records: 0,
    };
  }
};

const markPayrollsAsPrinted = async (filters, userId, tenantDb = null) => {
  let dbClient;
  if (tenantDb) {
    dbClient = getPrismaClient(tenantDb);
  } else {
    const store = asyncLocalStorage.getStore();
    if (store && store.tenantDb) {
      dbClient = prisma;
    } else {
      dbClient = prisma;
    }
  }

  try {
    let whereConditions = ["is_printed IS NULL OR is_printed = 'N'"];

    if (filters.employee_ids) {
      const validIds = filters.employee_ids.filter((id) => id && !isNaN(id));
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`employee_id IN (${idList})`);
      }
    } else if (filters.employee_id) {
      if (filters.employee_id.gte && filters.employee_id.lte) {
        whereConditions.push(
          `employee_id BETWEEN ${Number(filters.employee_id.gte)} AND ${Number(
            filters.employee_id.lte
          )}`
        );
      } else if (filters.employee_id.gte) {
        whereConditions.push(
          `employee_id >= ${Number(filters.employee_id.gte)}`
        );
      } else if (filters.employee_id.lte) {
        whereConditions.push(
          `employee_id <= ${Number(filters.employee_id.lte)}`
        );
      }
    }

    if (filters.payroll_month) {
      if (filters.payroll_month.gte && filters.payroll_month.lte) {
        whereConditions.push(
          `payroll_month BETWEEN ${Number(
            filters.payroll_month.gte
          )} AND ${Number(filters.payroll_month.lte)}`
        );
      } else if (filters.payroll_month.gte) {
        whereConditions.push(
          `payroll_month >= ${Number(filters.payroll_month.gte)}`
        );
      } else if (filters.payroll_month.lte) {
        whereConditions.push(
          `payroll_month <= ${Number(filters.payroll_month.lte)}`
        );
      }
    }

    if (filters.payroll_year) {
      if (filters.payroll_year.gte && filters.payroll_year.lte) {
        whereConditions.push(
          `payroll_year BETWEEN ${Number(
            filters.payroll_year.gte
          )} AND ${Number(filters.payroll_year.lte)}`
        );
      } else if (filters.payroll_year.gte) {
        whereConditions.push(
          `payroll_year >= ${Number(filters.payroll_year.gte)}`
        );
      } else if (filters.payroll_year.lte) {
        whereConditions.push(
          `payroll_year <= ${Number(filters.payroll_year.lte)}`
        );
      }
    }

    if (filters.status) {
      const escapedStatus = filters.status.replace(/'/g, "''");
      whereConditions.push(`status = '${escapedStatus}'`);
    }

    const whereClause = whereConditions.join(" AND ");

    const updateQuery = `
      UPDATE hrms_d_monthly_payroll_processing 
      SET is_printed = 'Y', 
          updatedate = GETDATE(),
          updatedby = ${userId}
      WHERE ${whereClause}
    `;

    const result = await dbClient.$executeRawUnsafe(updateQuery);

    console.log(`Marked ${result} payroll records as printed/downloaded`);
    return result;
  } catch (error) {
    console.error("Error marking payrolls as printed:", error);
    throw error;
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
  downloadPayslipPDF,
  getPayrollDataForExcel,
  getAllMonthlyPayrollsForBulkDownload,
  getMonthlyPayrollCountForBulkDownload,
  getMonthlyPayrollsPaginatedForBulkDownload,
  checkIndividualPayslipDownloaded,
  markIndividualPayslipAsPrinted,
  checkAlreadyDownloadedPayrolls,
  getDownloadStatistics,
  markPayrollsAsPrinted,
};
