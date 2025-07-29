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

const createMonthlyPayroll = async (data) => {
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

// Mothly payroll stored procedure
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

// Monthly payroll calculation Stored  procedure
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

// Generate
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

// const downloadPayslipPDF = async (employee_id, payroll_month, payroll_year) => {
//   try {
//     const payroll = await prisma.$queryRawUnsafe(`
//       SELECT
//   mp.*,
//   emp.full_name,
//   emp.employee_code AS pf_hr_id,
//   emp.account_number AS bank_account,
//   emp.work_location AS location,
//   emp.join_date AS engagement_date,
//   emp.national_id_number AS nrc_no,
//   emp.identification_number AS tpin_no,
//   emp.cost_center_id AS cost_center,
//   emp.email AS employee_email,
//   emp.bank_id,
//   emp.payment_mode,
//   d.designation_name AS designation,
//   b.bank_name AS bank_name
// FROM hrms_d_monthly_payroll_processing mp
// LEFT JOIN hrms_d_employee emp ON emp.id = mp.employee_id
// LEFT JOIN hrms_m_designation_master d ON d.id = emp.designation_id
// LEFT JOIN hrms_m_bank_master b ON b.id = emp.bank_id
// WHERE mp.employee_id = ${employee_id}
//   AND mp.payroll_month = ${payroll_month}
//   AND mp.payroll_year = ${payroll_year}

//     `);

//     if (!payroll || payroll.length === 0) return null;

//     const record = payroll[0];

//     const componentLabels = {
//       1111001: "BASIC PAY",
//       1111002: "HOUSING ALLOWANCE",
//       1111003: "LUNCH ALLOWANCE",
//       1111004: "TRANSPORT ALLOWANCE",
//       1111005: "EX-GRATIA PAYMENT",
//       1111006: "GRATUITY",
//       1112001: "NAPSA",
//       1112002: "NHIMA",
//       1112003: "Paye",
//     };

//     const earnings = [];
//     const deductions = [];

//     for (const key in record) {
//       if (/^\d{7}$/.test(key) && Number(record[key]) !== 0) {
//         const label = componentLabels[key] || `Component ${key}`;
//         if (parseInt(key) < 1112000) {
//           earnings.push({ label, amount: Number(record[key]) });
//         } else {
//           deductions.push({ label, amount: Number(record[key]) });
//         }
//       }
//     }

//     return {
//       employee_id: record.employee_id,
//       pf_hr_id: record.pf_hr_id || "",
//       full_name: record.full_name || "",
//       designation: record.designation || "",
//       location: record.location || "",
//       cost_center1_id: record.cost_center1_id || "",
//       cost_center2_id: record.cost_center2_id || "",
//       cost_center3_id: record.cost_center3_id || "",
//       cost_center4_id: record.cost_center4_id || "",
//       cost_center5_id: record.cost_center5_id || "",
//       napsa_no: record.napsa_no || "",
//       tpin_no: record.tpin_no || "",
//       nrc_no: record.nrc_no || "",
//       nhis_no: record.nhis_no || "",

//       engagement_date: record.engagement_date
//         ? new Date(record.engagement_date).toDateString()
//         : "",

//       leave_days: record.leave_days || 0,
//       leave_value: record.leave_value || 0,

//       taxable_ytd: record.taxable_earnings || 0,
//       tax_ytd: record.tax_amount || 0,

//       earnings,
//       deductions,
//       net_pay: record.net_pay || 0,

//       bank_name: record.bank_name || "NMB",
//       pay_point: record.pay_point || "NDOLA E WALLET",
//       bank_account: record.bank_account || "********",

//       leave_taken: record.leave_taken || 0,
//       actual_hours: record.actual_hours || "",
//       workday_ot: record.workday_ot || "",
//       night_hours: record.night_hours || "",
//       sunday_ot: record.sunday_ot || "",

//       month: record.payroll_month || "",
//       year: record.payroll_year || "",
//     };
//   } catch (error) {
//     console.error("Raw payslip fetch error:", error);
//     throw new CustomError("Error fetching payslip data", 500);
//   }
// };

const downloadPayslipPDF = async (employee_id, payroll_month, payroll_year) => {
  try {
    const payroll = await prisma.$queryRawUnsafe(`
      SELECT 
        mp.*,  
        emp.full_name,
        emp.employee_code AS pf_hr_id,
        emp.account_number AS bank_account,
        emp.work_location AS location,
        emp.join_date AS engagement_date,
        emp.national_id_number AS nrc_no,
        emp.identification_number AS tpin_no,
        emp.cost_center_id AS cost_center,
        emp.email AS employee_email,
        emp.bank_id,
        emp.payment_mode,
        d.designation_name AS designation,
        b.bank_name AS bank_name
      FROM hrms_d_monthly_payroll_processing mp
      LEFT JOIN hrms_d_employee emp ON emp.id = mp.employee_id
      LEFT JOIN hrms_m_designation_master d ON d.id = emp.designation_id
      LEFT JOIN hrms_m_bank_master b ON b.id = emp.bank_id
      WHERE mp.employee_id = ${Number(employee_id)}
        AND mp.payroll_month = ${Number(payroll_month)}
        AND mp.payroll_year = ${Number(payroll_year)}
    `);

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

    console.log("reqData", reqData);

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
      company_logo: reqData.company_logo || "",
      company_signature: reqData.company_signature || "",
    };
  } catch (error) {
    console.error("Raw payslip fetch error:", error);
    throw new CustomError("Error fetching payslip data", 500);
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
};
