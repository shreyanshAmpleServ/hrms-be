// // // ==== MODEL FUNCTION ====
// // // Add this function to monthlyPayrollModel.js

// // const getPayrollDataForExcel = async (
// //   search,
// //   employee_id,
// //   payroll_month,
// //   payroll_year
// // ) => {
// //   try {
// //     let whereClause = `WHERE 1=1`;

// //     // Filter by employee_id (exact match)
// //     if (employee_id && !isNaN(employee_id) && employee_id !== '') {
// //       whereClause += ` AND mp.employee_id = ${Number(employee_id)}`;
// //     }

// //     // Filter by payroll_month (exact match)
// //     if (payroll_month && !isNaN(payroll_month) && payroll_month !== '') {
// //       whereClause += ` AND mp.payroll_month = ${Number(payroll_month)}`;
// //     }

// //     // Filter by payroll_year (exact match)
// //     if (payroll_year && !isNaN(payroll_year) && payroll_year !== '') {
// //       whereClause += ` AND mp.payroll_year = ${Number(payroll_year)}`;
// //     }

// //     // Search functionality (partial match for employee name, code, status, etc.)
// //     if (search && search.trim() !== '') {
// //       const term = search.toLowerCase().replace(/'/g, "''");
// //       whereClause += `
// //         AND (
// //           LOWER(emp.full_name) LIKE '%${term}%'
// //           OR LOWER(emp.employee_code) LIKE '%${term}%'
// //           OR LOWER(mp.status) LIKE '%${term}%'
// //           OR LOWER(mp.remarks) LIKE '%${term}%'
// //           OR LOWER(mp.employee_email) LIKE '%${term}%'
// //           OR CAST(mp.payroll_month AS VARCHAR) LIKE '%${term}%'
// //           OR CAST(mp.payroll_year AS VARCHAR) LIKE '%${term}%'
// //         )
// //       `;
// //     }

// //     // Only include payrolls with valid employee
// //     whereClause += ` AND emp.id IS NOT NULL`;

// //     const query = `
// //       SELECT
// //         mp.*,
// //         emp.id AS employee_id,
// //         emp.full_name AS employee_full_name,
// //         emp.employee_code AS employee_code,
// //         emp.national_id_number AS nrc_no,
// //         emp.identification_number AS tpin_no,
// //         emp.join_date,
// //         emp.account_number AS bank_account,
// //         emp.work_location AS location,
// //         emp.email AS employee_email,
// //         cur.id AS currency_id,
// //         cur.currency_code,
// //         cur.currency_name,
// //         d.designation_name AS designation,
// //         dept.department_name AS department,
// //         b.bank_name AS bank_name
// //       FROM hrms_d_monthly_payroll_processing mp
// //       INNER JOIN hrms_d_employee emp ON emp.id = mp.employee_id
// //       LEFT JOIN hrms_m_currency_master cur ON cur.id = mp.pay_currency
// //       LEFT JOIN hrms_m_designation_master d ON d.id = emp.designation_id
// //       LEFT JOIN hrms_m_department_master dept ON dept.id = emp.department_id
// //       LEFT JOIN hrms_m_bank_master b ON b.id = emp.bank_id
// //       ${whereClause}
// //       ORDER BY mp.updatedate DESC, mp.payroll_year DESC, mp.payroll_month DESC;
// //     `;

// //     console.log('Excel Query:', query);

// //     const rawData = await prisma.$queryRawUnsafe(query);

// //     // Get component names for dynamic columns
// //     const componentResult = await prisma.$queryRawUnsafe(`
// //       SELECT * FROM vw_hrms_get_component_names
// //     `);

// //     const componentCodeToName = {};
// //     const componentCodeToPayType = {};

// //     if (componentResult && Array.isArray(componentResult)) {
// //       componentResult.forEach((component) => {
// //         if (component.component_code && component.component_name) {
// //           componentCodeToName[component.component_code] = component.component_name;
// //           componentCodeToPayType[component.component_code] = component.pay_or_deduct;
// //         }
// //       });
// //     }

// //     // Process the data and separate dynamic columns
// //     const processedData = rawData.map((row) => {
// //       const {
// //         employee_id,
// //         employee_full_name,
// //         employee_code,
// //         currency_id,
// //         currency_code,
// //         currency_name,
// //         ...payrollData
// //       } = row;

// //       // Separate static and dynamic columns
// //       const staticData = {};
// //       const dynamicComponents = {};

// //       for (const key in payrollData) {
// //         if (/^\d+$/.test(key)) {
// //           // Dynamic component column
// //           const componentName = componentCodeToName[key] || `Component_${key}`;
// //           const payType = componentCodeToPayType[key];
// //           const value = payrollData[key];

// //           if (value !== null && value !== 0 && value !== "0.00") {
// //             dynamicComponents[`${componentName} (${key})`] = Number(value);
// //           }
// //         } else {
// //           // Static column
// //           staticData[key] = payrollData[key];
// //         }
// //       }

// //       return {
// //         // Employee Information
// //         employee_id: employee_id,
// //         employee_code: employee_code,
// //         employee_full_name: employee_full_name,
// //         designation: payrollData.designation,
// //         department: payrollData.department,
// //         location: payrollData.location,
// //         join_date: payrollData.join_date,
// //         nrc_no: payrollData.nrc_no,
// //         tpin_no: payrollData.tpin_no,
// //         bank_account: payrollData.bank_account,
// //         bank_name: payrollData.bank_name,
// //         employee_email: payrollData.employee_email,

// //         // Payroll Information
// //         payroll_month: staticData.payroll_month,
// //         payroll_year: staticData.payroll_year,
// //         payroll_week: staticData.payroll_week,
// //         payroll_start_date: staticData.payroll_start_date,
// //         payroll_end_date: staticData.payroll_end_date,
// //         payroll_paid_days: staticData.payroll_paid_days,

// //         // Financial Information
// //         currency_code: currency_code,
// //         currency_name: currency_name,
// //         basic_salary: staticData.basic_salary,
// //         total_earnings: staticData.total_earnings,
// //         taxable_earnings: staticData.taxable_earnings,
// //         tax_amount: staticData.tax_amount,
// //         total_deductions: staticData.total_deductions,
// //         net_pay: staticData.net_pay,

// //         // Status and Dates
// //         status: staticData.status,
// //         processed: staticData.processed,
// //         execution_date: staticData.execution_date,
// //         pay_date: staticData.pay_date,
// //         doc_date: staticData.doc_date,
// //         processed_on: staticData.processed_on,

// //         // Approvals
// //         approved1: staticData.approved1,
// //         approver1_id: staticData.approver1_id,

// //         // Cost Centers
// //         project_id: staticData.project_id,
// //         cost_center1_id: staticData.cost_center1_id,
// //         cost_center2_id: staticData.cost_center2_id,
// //         cost_center3_id: staticData.cost_center3_id,
// //         cost_center4_id: staticData.cost_center4_id,
// //         cost_center5_id: staticData.cost_center5_id,

// //         // Other
// //         je_transid: staticData.je_transid,
// //         remarks: staticData.remarks,

// //         // Dynamic component columns
// //         ...dynamicComponents,

// //         // Audit fields
// //         createdby: staticData.createdby,
// //         createdate: staticData.createdate,
// //         updatedby: staticData.updatedby,
// //         updatedate: staticData.updatedate,
// //         log_inst: staticData.log_inst
// //       };
// //     });

// //     return {
// //       data: processedData,
// //       componentMapping: componentCodeToName,
// //       totalRecords: processedData.length
// //     };
// //   } catch (error) {
// //     console.error("Excel data retrieval error", error);
// //     throw new Error("Error retrieving payroll data for Excel export");
// //   }
// // };

// // // ==== SERVICE FUNCTION ====
// // // Add this function to monthlyPayrollService.js

// // const downloadPayrollExcel = async (search, employee_id, payroll_month, payroll_year) => {
// //   try {
// //     const result = await monthlyPayrollModel.getPayrollDataForExcel(
// //       search,
// //       employee_id,
// //       payroll_month,
// //       payroll_year
// //     );

// //     if (!result.data || result.data.length === 0) {
// //       throw new CustomError("No payroll data found for the specified filters", 404);
// //     }

// //     // Create Excel file
// //     const XLSX = require('xlsx');
// //     const workbook = XLSX.utils.book_new();

// //     // Create worksheet from data
// //     const worksheet = XLSX.utils.json_to_sheet(result.data);

// //     // Add worksheet to workbook
// //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Payroll');

// //     // Generate filename with timestamp and filters
// //     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
// //     let filename = `Monthly_Payroll_${timestamp}`;

// //     if (employee_id) filename += `_Emp${employee_id}`;
// //     if (payroll_month) filename += `_M${payroll_month}`;
// //     if (payroll_year) filename += `_Y${payroll_year}`;
// //     if (search) filename += `_Search_${search.replace(/[^a-zA-Z0-9]/g, '_')}`;

// //     filename += '.xlsx';

// //     // Create file path
// //     const filePath = path.join(__dirname, `../../exports/${filename}`);

// //     // Ensure directory exists
// //     if (!fs.existsSync(path.dirname(filePath))) {
// //       fs.mkdirSync(path.dirname(filePath), { recursive: true });
// //     }

// //     // Write file
// //     XLSX.writeFile(workbook, filePath);

// //     return {
// //       filePath,
// //       filename,
// //       totalRecords: result.totalRecords,
// //       componentMapping: result.componentMapping
// //     };

// //   } catch (error) {
// //     console.error("Excel generation error:", error);
// //     throw new CustomError(`Failed to generate Excel file: ${error.message}`, 500);
// //   }
// // };

// // // ==== CONTROLLER FUNCTION ====
// // // Add this function to monthlyPayrollController.js

// // const downloadPayrollExcel = async (req, res, next) => {
// //   try {
// //     const { search, employee_id, payroll_month, payroll_year } = req.query;

// //     console.log('Excel download parameters:', {
// //       search,
// //       employee_id,
// //       payroll_month,
// //       payroll_year
// //     });

// //     const result = await monthlyPayrollService.downloadPayrollExcel(
// //       search,
// //       employee_id,
// //       payroll_month,
// //       payroll_year
// //     );

// //     // Set headers for file download
// //     res.setHeader(
// //       'Content-Type',
// //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
// //     );
// //     res.setHeader(
// //       'Content-Disposition',
// //       `attachment; filename="${result.filename}"`
// //     );
// //     res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

// //     // Send file
// //     res.sendFile(result.filePath, (err) => {
// //       if (err) {
// //         console.error('Error sending Excel file:', err);
// //         return next(err);
// //       }

// //       // Clean up file after 5 minutes
// //       setTimeout(() => {
// //         fs.unlink(result.filePath, (unlinkErr) => {
// //           if (unlinkErr) {
// //             console.error('Error deleting Excel file:', unlinkErr);
// //           } else {
// //             console.log(`Deleted temporary Excel file: ${result.filePath}`);
// //           }
// //         });
// //       }, 5 * 60 * 1000);
// //     });

// //   } catch (error) {
// //     console.error('Excel download controller error:', error);
// //     next(error);
// //   }
// // };

// // // ==== ROUTE ====
// // // Add this route to your routes file

// // router.get(
// //   "/monthly-payroll/download-excel",
// //   authenticateToken,
// //   monthlyPayrollController.downloadPayrollExcel
// // );

// // // ==== MODULE EXPORTS UPDATES ====

// // // Add to monthlyPayrollModel.js exports:
// // module.exports = {
// //   // ... existing exports
// //   getPayrollDataForExcel,
// // };

// // // Add to monthlyPayrollService.js exports:
// // module.exports = {
// //   // ... existing exports
// //   downloadPayrollExcel,
// // };

// // // Add to monthlyPayrollController.js exports:
// // module.exports = {
// //   // ... existing exports
// //   downloadPayrollExcel,
// // };

// // // ==== PACKAGE.JSON DEPENDENCY ====
// // // Make sure to install xlsx package:
// // // npm install xlsx

// // If you choose ExcelJS instead of XLSX, replace the Excel generation part in the service:
// // ===============================
// // MODEL - monthlyPayrollModel.js
// // ===============================
// // Add this function to your existing monthlyPayrollModel.js

// const getPayrollDataForExcel = async (
//   search,
//   employee_id,
//   payroll_month,
//   payroll_year
// ) => {
//   try {
//     let whereClause = `WHERE 1=1`;

//     // Filter by employee_id (exact match)
//     if (employee_id && !isNaN(employee_id) && employee_id !== "") {
//       whereClause += ` AND mp.employee_id = ${Number(employee_id)}`;
//     }

//     // Filter by payroll_month (exact match)
//     if (payroll_month && !isNaN(payroll_month) && payroll_month !== "") {
//       whereClause += ` AND mp.payroll_month = ${Number(payroll_month)}`;
//     }

//     // Filter by payroll_year (exact match)
//     if (payroll_year && !isNaN(payroll_year) && payroll_year !== "") {
//       whereClause += ` AND mp.payroll_year = ${Number(payroll_year)}`;
//     }

//     // Search functionality (partial match for employee name, code, status, etc.)
//     if (search && search.trim() !== "") {
//       const term = search.toLowerCase().replace(/'/g, "''");
//       whereClause += `
//         AND (
//           LOWER(emp.full_name) LIKE '%${term}%'
//           OR LOWER(emp.employee_code) LIKE '%${term}%'
//           OR LOWER(mp.status) LIKE '%${term}%'
//           OR LOWER(mp.remarks) LIKE '%${term}%'
//           OR LOWER(mp.employee_email) LIKE '%${term}%'
//           OR CAST(mp.payroll_month AS VARCHAR) LIKE '%${term}%'
//           OR CAST(mp.payroll_year AS VARCHAR) LIKE '%${term}%'
//         )
//       `;
//     }

//     // Only include payrolls with valid employee
//     whereClause += ` AND emp.id IS NOT NULL`;

//     const query = `
//       SELECT
//         mp.*,
//         emp.id AS emp_id,
//         emp.full_name AS employee_full_name,
//         emp.employee_code AS employee_code,
//         emp.national_id_number AS nrc_no,
//         emp.identification_number AS tpin_no,
//         emp.join_date,
//         emp.account_number AS bank_account,
//         emp.work_location AS location,
//         emp.email AS emp_email,
//         emp.napsa_no,
//         emp.nhis_no,
//         cur.id AS currency_id,
//         cur.currency_code,
//         cur.currency_name,
//         d.designation_name AS designation,
//         dept.department_name AS department,
//         b.bank_name AS bank_name,
//         cc.cost_center_name AS cost_center_name
//       FROM hrms_d_monthly_payroll_processing mp
//       INNER JOIN hrms_d_employee emp ON emp.id = mp.employee_id
//       LEFT JOIN hrms_m_currency_master cur ON cur.id = mp.pay_currency
//       LEFT JOIN hrms_m_designation_master d ON d.id = emp.designation_id
//       LEFT JOIN hrms_m_department_master dept ON dept.id = emp.department_id
//       LEFT JOIN hrms_m_bank_master b ON b.id = emp.bank_id
//       LEFT JOIN hrms_m_cost_center_master cc ON cc.id = emp.cost_center_id
//       ${whereClause}
//       ORDER BY mp.updatedate DESC, mp.payroll_year DESC, mp.payroll_month DESC;
//     `;

//     console.log("Excel Query:", query);

//     const rawData = await prisma.$queryRawUnsafe(query);

//     // Get component names for dynamic columns
//     const componentResult = await prisma.$queryRawUnsafe(`
//       SELECT * FROM vw_hrms_get_component_names ORDER BY component_code
//     `);

//     const componentCodeToName = {};
//     const componentCodeToPayType = {};
//     const earningsComponents = [];
//     const deductionComponents = [];

//     if (componentResult && Array.isArray(componentResult)) {
//       componentResult.forEach((component) => {
//         if (component.component_code && component.component_name) {
//           componentCodeToName[component.component_code] =
//             component.component_name;
//           componentCodeToPayType[component.component_code] =
//             component.pay_or_deduct;

//           if (component.pay_or_deduct === "P") {
//             earningsComponents.push(component.component_code);
//           } else if (component.pay_or_deduct === "D") {
//             deductionComponents.push(component.component_code);
//           }
//         }
//       });
//     }

//     // Process the data and separate dynamic columns
//     const processedData = rawData.map((row) => {
//       const processedRow = {
//         // Employee Information
//         employee_id: row.emp_id,
//         employee_code: row.employee_code,
//         employee_full_name: row.employee_full_name,
//         designation: row.designation || "",
//         department: row.department || "",
//         location: row.location || "",
//         cost_center_name: row.cost_center_name || "",
//         join_date: row.join_date ? new Date(row.join_date) : null,
//         nrc_no: row.nrc_no || "",
//         tpin_no: row.tpin_no || "",
//         napsa_no: row.napsa_no || "",
//         nhis_no: row.nhis_no || "",
//         bank_account: row.bank_account || "",
//         bank_name: row.bank_name || "",
//         employee_email: row.emp_email || "",

//         // Payroll Information
//         payroll_month: row.payroll_month,
//         payroll_year: row.payroll_year,
//         payroll_week: row.payroll_week || 0,
//         payroll_start_date: row.payroll_start_date
//           ? new Date(row.payroll_start_date)
//           : null,
//         payroll_end_date: row.payroll_end_date
//           ? new Date(row.payroll_end_date)
//           : null,
//         payroll_paid_days: row.payroll_paid_days || 0,

//         // Currency Information
//         currency_code: row.currency_code || "",
//         currency_name: row.currency_name || "",

//         // Financial Summary
//         basic_salary: Number(row.basic_salary) || 0,
//         total_earnings: Number(row.total_earnings) || 0,
//         taxable_earnings: Number(row.taxable_earnings) || 0,
//         tax_amount: Number(row.tax_amount) || 0,
//         total_deductions: Number(row.total_deductions) || 0,
//         net_pay: Number(row.net_pay) || 0,

//         // Status and Control
//         status: row.status || "",
//         processed: row.processed || "N",
//         execution_date: row.execution_date
//           ? new Date(row.execution_date)
//           : null,
//         pay_date: row.pay_date ? new Date(row.pay_date) : null,
//         doc_date: row.doc_date ? new Date(row.doc_date) : null,
//         processed_on: row.processed_on ? new Date(row.processed_on) : null,

//         // Approval Information
//         approved1: row.approved1 || "N",
//         approver1_id: row.approver1_id || "",

//         // Project and Cost Centers
//         project_id: row.project_id || "",
//         cost_center1_id: row.cost_center1_id || "",
//         cost_center2_id: row.cost_center2_id || "",
//         cost_center3_id: row.cost_center3_id || "",
//         cost_center4_id: row.cost_center4_id || "",
//         cost_center5_id: row.cost_center5_id || "",

//         // Other Fields
//         je_transid: row.je_transid || "",
//         remarks: row.remarks || "",

//         // Audit Fields
//         createdby: row.createdby || "",
//         createdate: row.createdate ? new Date(row.createdate) : null,
//         updatedby: row.updatedby || "",
//         updatedate: row.updatedate ? new Date(row.updatedate) : null,
//         log_inst: row.log_inst || "",
//       };

//       // Add dynamic component columns (earnings first, then deductions)
//       [...earningsComponents, ...deductionComponents].forEach(
//         (componentCode) => {
//           const value = Number(row[componentCode]) || 0;
//           const componentName =
//             componentCodeToName[componentCode] || `Component_${componentCode}`;
//           const payType = componentCodeToPayType[componentCode];
//           processedRow[`${componentName} (${componentCode})`] = value;
//         }
//       );

//       return processedRow;
//     });

//     return {
//       data: processedData,
//       componentMapping: componentCodeToName,
//       earningsComponents,
//       deductionComponents,
//       totalRecords: processedData.length,
//     };
//   } catch (error) {
//     console.error("Excel data retrieval error", error);
//     throw new Error("Error retrieving payroll data for Excel export");
//   }
// };

// // ===============================
// // SERVICE - monthlyPayrollService.js
// // ===============================
// // Add this function to your existing monthlyPayrollService.js

// const ExcelJS = require("exceljs");
// const fs = require("fs");
// const path = require("path");

// const downloadPayrollExcel = async (
//   search,
//   employee_id,
//   payroll_month,
//   payroll_year
// ) => {
//   try {
//     const result = await monthlyPayrollModel.getPayrollDataForExcel(
//       search,
//       employee_id,
//       payroll_month,
//       payroll_year
//     );

//     if (!result.data || result.data.length === 0) {
//       throw new CustomError(
//         "No payroll data found for the specified filters",
//         404
//       );
//     }

//     // Create Excel workbook and worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Monthly Payroll Data");

//     // Define static columns
//     const staticColumns = [
//       // Employee Information
//       { header: "Employee ID", key: "employee_id", width: 12 },
//       { header: "Employee Code", key: "employee_code", width: 15 },
//       { header: "Employee Name", key: "employee_full_name", width: 25 },
//       { header: "Designation", key: "designation", width: 20 },
//       { header: "Department", key: "department", width: 20 },
//       { header: "Location", key: "location", width: 15 },
//       { header: "Cost Center", key: "cost_center_name", width: 18 },
//       { header: "Join Date", key: "join_date", width: 12 },
//       { header: "NRC No", key: "nrc_no", width: 15 },
//       { header: "TPIN No", key: "tpin_no", width: 15 },
//       { header: "NAPSA No", key: "napsa_no", width: 15 },
//       { header: "NHIS No", key: "nhis_no", width: 15 },
//       { header: "Bank Account", key: "bank_account", width: 18 },
//       { header: "Bank Name", key: "bank_name", width: 15 },
//       { header: "Email", key: "employee_email", width: 25 },

//       // Payroll Information
//       { header: "Payroll Month", key: "payroll_month", width: 12 },
//       { header: "Payroll Year", key: "payroll_year", width: 12 },
//       { header: "Payroll Week", key: "payroll_week", width: 12 },
//       { header: "Start Date", key: "payroll_start_date", width: 12 },
//       { header: "End Date", key: "payroll_end_date", width: 12 },
//       { header: "Paid Days", key: "payroll_paid_days", width: 10 },

//       // Currency
//       { header: "Currency Code", key: "currency_code", width: 10 },
//       { header: "Currency Name", key: "currency_name", width: 15 },

//       // Financial Summary
//       { header: "Basic Salary", key: "basic_salary", width: 15 },
//       { header: "Total Earnings", key: "total_earnings", width: 15 },
//       { header: "Taxable Earnings", key: "taxable_earnings", width: 15 },
//       { header: "Tax Amount", key: "tax_amount", width: 15 },
//       { header: "Total Deductions", key: "total_deductions", width: 15 },
//       { header: "Net Pay", key: "net_pay", width: 15 },
//     ];

//     // Add dynamic component columns
//     const dynamicColumns = [];

//     // Add earnings components
//     result.earningsComponents.forEach((componentCode) => {
//       const componentName =
//         result.componentMapping[componentCode] || `Component_${componentCode}`;
//       dynamicColumns.push({
//         header: `${componentName} (${componentCode})`,
//         key: `${componentName} (${componentCode})`,
//         width: 18,
//       });
//     });

//     // Add deduction components
//     result.deductionComponents.forEach((componentCode) => {
//       const componentName =
//         result.componentMapping[componentCode] || `Component_${componentCode}`;
//       dynamicColumns.push({
//         header: `${componentName} (${componentCode})`,
//         key: `${componentName} (${componentCode})`,
//         width: 18,
//       });
//     });

//     // Additional status and control columns
//     const additionalColumns = [
//       { header: "Status", key: "status", width: 10 },
//       { header: "Processed", key: "processed", width: 10 },
//       { header: "Execution Date", key: "execution_date", width: 15 },
//       { header: "Pay Date", key: "pay_date", width: 12 },
//       { header: "Doc Date", key: "doc_date", width: 12 },
//       { header: "Processed On", key: "processed_on", width: 15 },
//       { header: "Approved", key: "approved1", width: 10 },
//       { header: "Approver ID", key: "approver1_id", width: 12 },
//       { header: "Project ID", key: "project_id", width: 12 },
//       { header: "Cost Center 1", key: "cost_center1_id", width: 12 },
//       { header: "Cost Center 2", key: "cost_center2_id", width: 12 },
//       { header: "Cost Center 3", key: "cost_center3_id", width: 12 },
//       { header: "Cost Center 4", key: "cost_center4_id", width: 12 },
//       { header: "Cost Center 5", key: "cost_center5_id", width: 12 },
//       { header: "JE Trans ID", key: "je_transid", width: 12 },
//       { header: "Remarks", key: "remarks", width: 30 },
//       { header: "Created By", key: "createdby", width: 12 },
//       { header: "Create Date", key: "createdate", width: 15 },
//       { header: "Updated By", key: "updatedby", width: 12 },
//       { header: "Update Date", key: "updatedate", width: 15 },
//       { header: "Log Instance", key: "log_inst", width: 12 },
//     ];

//     // Combine all columns
//     const allColumns = [
//       ...staticColumns,
//       ...dynamicColumns,
//       ...additionalColumns,
//     ];
//     worksheet.columns = allColumns;

//     // Style the header row
//     const headerRow = worksheet.getRow(1);
//     headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
//     headerRow.fill = {
//       type: "pattern",
//       pattern: "solid",
//       fgColor: { argb: "FF366092" },
//     };
//     headerRow.height = 20;
//     headerRow.alignment = { vertical: "middle", horizontal: "center" };

//     // Add data rows
//     result.data.forEach((row, index) => {
//       const dataRow = worksheet.addRow(row);

//       // Alternate row colors
//       if (index % 2 === 1) {
//         dataRow.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: "FFF8F9FA" },
//         };
//       }
//     });

//     // Format currency columns
//     const currencyColumns = [
//       "basic_salary",
//       "total_earnings",
//       "taxable_earnings",
//       "tax_amount",
//       "total_deductions",
//       "net_pay",
//     ];

//     currencyColumns.forEach((colKey) => {
//       const col = worksheet.getColumn(colKey);
//       if (col) {
//         col.numFmt = "#,##0.00";
//         col.alignment = { horizontal: "right" };
//       }
//     });

//     // Format dynamic component columns (currency format)
//     [...result.earningsComponents, ...result.deductionComponents].forEach(
//       (componentCode) => {
//         const componentName =
//           result.componentMapping[componentCode] ||
//           `Component_${componentCode}`;
//         const col = worksheet.getColumn(`${componentName} (${componentCode})`);
//         if (col) {
//           col.numFmt = "#,##0.00";
//           col.alignment = { horizontal: "right" };
//         }
//       }
//     );

//     // Format date columns
//     const dateColumns = [
//       "join_date",
//       "payroll_start_date",
//       "payroll_end_date",
//       "execution_date",
//       "pay_date",
//       "doc_date",
//       "processed_on",
//       "createdate",
//       "updatedate",
//     ];

//     dateColumns.forEach((colKey) => {
//       const col = worksheet.getColumn(colKey);
//       if (col) {
//         col.numFmt = "dd/mm/yyyy";
//         col.alignment = { horizontal: "center" };
//       }
//     });

//     // Add borders to all cells
//     worksheet.eachRow((row, rowNumber) => {
//       row.eachCell((cell) => {
//         cell.border = {
//           top: { style: "thin", color: { argb: "FFD3D3D3" } },
//           left: { style: "thin", color: { argb: "FFD3D3D3" } },
//           bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
//           right: { style: "thin", color: { argb: "FFD3D3D3" } },
//         };
//       });
//     });

//     // Auto-fit columns
//     worksheet.columns.forEach((column) => {
//       if (column.header && column.header.length > column.width) {
//         column.width = column.header.length + 2;
//       }
//     });

//     // Generate filename with timestamp and filters
//     const timestamp = new Date()
//       .toISOString()
//       .replace(/[:.]/g, "-")
//       .split("T")[0];
//     let filename = `Monthly_Payroll_${timestamp}`;

//     if (employee_id) filename += `_Emp${employee_id}`;
//     if (payroll_month)
//       filename += `_M${String(payroll_month).padStart(2, "0")}`;
//     if (payroll_year) filename += `_Y${payroll_year}`;
//     if (search) filename += `_Search_${search.replace(/[^a-zA-Z0-9]/g, "_")}`;

//     filename += ".xlsx";

//     // Create file path
//     const filePath = path.join(__dirname, `../../exports/${filename}`);

//     // Ensure directory exists
//     if (!fs.existsSync(path.dirname(filePath))) {
//       fs.mkdirSync(path.dirname(filePath), { recursive: true });
//     }

//     // Write file
//     await workbook.xlsx.writeFile(filePath);

//     console.log(`Excel file created: ${filePath}`);

//     return {
//       filePath,
//       filename,
//       totalRecords: result.totalRecords,
//       componentMapping: result.componentMapping,
//       earningsCount: result.earningsComponents.length,
//       deductionsCount: result.deductionComponents.length,
//     };
//   } catch (error) {
//     console.error("Excel generation error:", error);
//     throw new CustomError(
//       `Failed to generate Excel file: ${error.message}`,
//       500
//     );
//   }
// };

// // ===============================
// // CONTROLLER - monthlyPayrollController.js
// // ===============================
// // Add this function to your existing monthlyPayrollController.js

// const downloadPayrollExcel = async (req, res, next) => {
//   try {
//     const { search, employee_id, payroll_month, payroll_year } = req.query;

//     console.log("Excel download parameters:", {
//       search,
//       employee_id,
//       payroll_month,
//       payroll_year,
//       user: req.user?.id,
//     });

//     // Log activity
//     await logActivity(
//       req.user.id,
//       "EXPORT",
//       "MONTHLY_PAYROLL_EXCEL",
//       `Excel export with filters: employee_id=${employee_id || "all"}, month=${
//         payroll_month || "all"
//       }, year=${payroll_year || "all"}, search=${search || "none"}`,
//       req.user.log_inst
//     );

//     const result = await monthlyPayrollService.downloadPayrollExcel(
//       search,
//       employee_id,
//       payroll_month,
//       payroll_year
//     );

//     console.log(`Excel file generated successfully: ${result.filename}`);
//     console.log(
//       `Total records: ${result.totalRecords}, Earnings: ${result.earningsCount}, Deductions: ${result.deductionsCount}`
//     );

//     // Set headers for file download
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${result.filename}"`
//     );
//     res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
//     res.setHeader("Cache-Control", "no-cache");

//     // Send file
//     res.sendFile(result.filePath, (err) => {
//       if (err) {
//         console.error("Error sending Excel file:", err);
//         return next(new CustomError("Failed to send Excel file", 500));
//       }

//       console.log(`Excel file sent successfully: ${result.filename}`);

//       // Clean up file after 10 minutes
//       setTimeout(() => {
//         fs.unlink(result.filePath, (unlinkErr) => {
//           if (unlinkErr) {
//             console.error("Error deleting Excel file:", unlinkErr);
//           } else {
//             console.log(`Deleted temporary Excel file: ${result.filePath}`);
//           }
//         });
//       }, 10 * 60 * 1000); // 10 minutes
//     });
//   } catch (error) {
//     console.error("Excel download controller error:", error);

//     // Log error activity
//     if (req.user?.id) {
//       await logActivity(
//         req.user.id,
//         "EXPORT_ERROR",
//         "MONTHLY_PAYROLL_EXCEL",
//         `Excel export failed: ${error.message}`,
//         req.user.log_inst
//       );
//     }

//     next(error);
//   }
// };

// // ===============================
// // ROUTES - Add to your routes file
// // ===============================

// // Add this route to your existing routes
// router.get(
//   "/monthly-payroll/download-excel",
//   authenticateToken,
//   monthlyPayrollController.downloadPayrollExcel
// );

// // ===============================
// // MODULE EXPORTS UPDATES
// // ===============================

// // Add to monthlyPayrollModel.js exports:
// module.exports = {
//   createMonthlyPayroll,
//   findMonthlyPayrollById,
//   updateMonthlyPayroll,
//   deleteMonthlyPayroll,
//   getAllMonthlyPayroll,
//   callMonthlyPayrollSP,
//   getComponentNames,
//   triggerMonthlyPayrollCalculationSP,
//   createOrUpdatePayrollBulk,
//   getGeneratedMonthlyPayroll,
//   downloadPayslipPDF,
//   getPayrollDataForExcel, // Add this new function
// };

// // Add to monthlyPayrollService.js exports:
// module.exports = {
//   createMonthlyPayroll,
//   findMonthlyPayrollById,
//   updateMonthlyPayroll,
//   deleteMonthlyPayroll,
//   getAllMonthlyPayroll,
//   callMonthlyPayrollSP,
//   getComponentNames,
//   triggerMonthlyPayrollCalculationSP,
//   createOrUpdatePayrollBulk,
//   getGeneratedMonthlyPayroll,
//   downloadPayslipPDF,
//   downloadPayrollExcel, // Add this new function
// };

// // Add to monthlyPayrollController.js exports:
// module.exports = {
//   createMonthlyPayroll,
//   findMonthlyPayroll,
//   updateMonthlyPayroll,
//   deleteMonthlyPayroll,
//   getAllMonthlyPayroll,
//   triggerMonthlyPayrollSP,
//   getComponentNames,
//   triggerMonthlyPayrollCalculationSP,
//   createOrUpdateMonthlyPayroll,
//   getGeneratedMonthlyPayroll,
//   downloadPayslipPDF,
//   downloadPayrollExcel, // Add this new function
// };

// // ===============================
// // PACKAGE INSTALLATION
// // ===============================
// /*
// Install required package:
// npm install exceljs

// Usage Examples:

// 1. Download all payroll data:
//    GET /monthly-payroll/download-excel

// 2. Download for specific employee:
//    GET /monthly-payroll/download-excel?employee_id=123

// 3. Download for specific month/year:
//    GET /monthly-payroll/download-excel?payroll_month=12&payroll_year=2023

// 4. Download with search:
//    GET /monthly-payroll/download-excel?search=John

// 5. Download with all filters:
//    GET /monthly-payroll/download-excel?employee_id=123&payroll_month=12&payroll_year=2023&search=active

// ===============================
// MODEL - monthlyPayrollModel.js
// ===============================
// Add this function to your existing monthlyPayrollModel.js

//////////////////////////////////////////////
// const getPayrollDataForExcel = async (
//   search,
//   employee_id,
//   payroll_month,
//   payroll_year
// ) => {
//   try {
//     let whereClause = `WHERE 1=1`;

//     // Filter by employee_id (exact match)
//     if (employee_id && !isNaN(employee_id) && employee_id !== '') {
//       whereClause += ` AND mp.employee_id = ${Number(employee_id)}`;
//     }

//     // Filter by payroll_month (exact match)
//     if (payroll_month && !isNaN(payroll_month) && payroll_month !== '') {
//       whereClause += ` AND mp.payroll_month = ${Number(payroll_month)}`;
//     }

//     // Filter by payroll_year (exact match)
//     if (payroll_year && !isNaN(payroll_year) && payroll_year !== '') {
//       whereClause += ` AND mp.payroll_year = ${Number(payroll_year)}`;
//     }

//     // Search functionality (partial match for employee name, code, status, etc.)
//     if (search && search.trim() !== '') {
//       const term = search.toLowerCase().replace(/'/g, "''");
//       whereClause += `
//         AND (
//           LOWER(emp.full_name) LIKE '%${term}%'
//           OR LOWER(emp.employee_code) LIKE '%${term}%'
//           OR LOWER(mp.status) LIKE '%${term}%'
//           OR LOWER(mp.remarks) LIKE '%${term}%'
//           OR LOWER(mp.employee_email) LIKE '%${term}%'
//           OR CAST(mp.payroll_month AS VARCHAR) LIKE '%${term}%'
//           OR CAST(mp.payroll_year AS VARCHAR) LIKE '%${term}%'
//         )
//       `;
//     }

//     // Only include payrolls with valid employee
//     whereClause += ` AND emp.id IS NOT NULL`;

//     const query = `
//       SELECT
//         mp.*,
//         emp.id AS emp_id,
//         emp.full_name AS employee_full_name,
//         emp.employee_code AS employee_code,
//         emp.national_id_number AS nrc_no,
//         emp.identification_number AS tpin_no,
//         emp.join_date,
//         emp.account_number AS bank_account,
//         emp.work_location AS location,
//         emp.email AS emp_email,
//         emp.napsa_no,
//         emp.nhis_no,
//         cur.id AS currency_id,
//         cur.currency_code,
//         cur.currency_name,
//         d.designation_name AS designation,
//         dept.department_name AS department,
//         b.bank_name AS bank_name,
//         cc.cost_center_name AS cost_center_name
//       FROM hrms_d_monthly_payroll_processing mp
//       INNER JOIN hrms_d_employee emp ON emp.id = mp.employee_id
//       LEFT JOIN hrms_m_currency_master cur ON cur.id = mp.pay_currency
//       LEFT JOIN hrms_m_designation_master d ON d.id = emp.designation_id
//       LEFT JOIN hrms_m_department_master dept ON dept.id = emp.department_id
//       LEFT JOIN hrms_m_bank_master b ON b.id = emp.bank_id
//       LEFT JOIN hrms_m_cost_center_master cc ON cc.id = emp.cost_center_id
//       ${whereClause}
//       ORDER BY mp.updatedate DESC, mp.payroll_year DESC, mp.payroll_month DESC;
//     `;

//     console.log('Excel Query:', query);

//     const rawData = await prisma.$queryRawUnsafe(query);

//     // Get component names for dynamic columns
//     const componentResult = await prisma.$queryRawUnsafe(`
//       SELECT * FROM vw_hrms_get_component_names ORDER BY component_code
//     `);

//     const componentCodeToName = {};
//     const componentCodeToPayType = {};
//     const earningsComponents = [];
//     const deductionComponents = [];

//     if (componentResult && Array.isArray(componentResult)) {
//       componentResult.forEach((component) => {
//         if (component.component_code && component.component_name) {
//           componentCodeToName[component.component_code] = component.component_name;
//           componentCodeToPayType[component.component_code] = component.pay_or_deduct;

//           if (component.pay_or_deduct === 'P') {
//             earningsComponents.push(component.component_code);
//           } else if (component.pay_or_deduct === 'D') {
//             deductionComponents.push(component.component_code);
//           }
//         }
//       });
//     }

//     // Process the data and separate dynamic columns
//     const processedData = rawData.map((row) => {
//       const processedRow = {
//         // Employee Information
//         employee_id: row.emp_id,
//         employee_code: row.employee_code,
//         employee_full_name: row.employee_full_name,
//         designation: row.designation || '',
//         department: row.department || '',
//         location: row.location || '',
//         cost_center_name: row.cost_center_name || '',
//         join_date: row.join_date ? new Date(row.join_date) : null,
//         nrc_no: row.nrc_no || '',
//         tpin_no: row.tpin_no || '',
//         napsa_no: row.napsa_no || '',
//         nhis_no: row.nhis_no || '',
//         bank_account: row.bank_account || '',
//         bank_name: row.bank_name || '',
//         employee_email: row.emp_email || '',

//         // Payroll Information
//         payroll_month: row.payroll_month,
//         payroll_year: row.payroll_year,
//         payroll_week: row.payroll_week || 0,
//         payroll_start_date: row.payroll_start_date ? new Date(row.payroll_start_date) : null,
//         payroll_end_date: row.payroll_end_date ? new Date(row.payroll_end_date) : null,
//         payroll_paid_days: row.payroll_paid_days || 0,

//         // Currency Information
//         currency_code: row.currency_code || '',
//         currency_name: row.currency_name || '',

//         // Financial Summary
//         basic_salary: Number(row.basic_salary) || 0,
//         total_earnings: Number(row.total_earnings) || 0,
//         taxable_earnings: Number(row.taxable_earnings) || 0,
//         tax_amount: Number(row.tax_amount) || 0,
//         total_deductions: Number(row.total_deductions) || 0,
//         net_pay: Number(row.net_pay) || 0,

//         // Status and Control
//         status: row.status || '',
//         processed: row.processed || 'N',
//         execution_date: row.execution_date ? new Date(row.execution_date) : null,
//         pay_date: row.pay_date ? new Date(row.pay_date) : null,
//         doc_date: row.doc_date ? new Date(row.doc_date) : null,
//         processed_on: row.processed_on ? new Date(row.processed_on) : null,

//         // Approval Information
//         approved1: row.approved1 || 'N',
//         approver1_id: row.approver1_id || '',

//         // Project and Cost Centers
//         project_id: row.project_id || '',
//         cost_center1_id: row.cost_center1_id || '',
//         cost_center2_id: row.cost_center2_id || '',
//         cost_center3_id: row.cost_center3_id || '',
//         cost_center4_id: row.cost_center4_id || '',
//         cost_center5_id: row.cost_center5_id || '',

//         // Other Fields
//         je_transid: row.je_transid || '',
//         remarks: row.remarks || '',

//         // Audit Fields
//         createdby: row.createdby || '',
//         createdate: row.createdate ? new Date(row.createdate) : null,
//         updatedby: row.updatedby || '',
//         updatedate: row.updatedate ? new Date(row.updatedate) : null,
//         log_inst: row.log_inst || ''
//       };

//       // Add dynamic component columns (earnings first, then deductions)
//       [...earningsComponents, ...deductionComponents].forEach(componentCode => {
//         const value = Number(row[componentCode]) || 0;
//         const componentName = componentCodeToName[componentCode] || `Component_${componentCode}`;
//         const payType = componentCodeToPayType[componentCode];
//         processedRow[`${componentName} (${componentCode})`] = value;
//       });

//       return processedRow;
//     });

//     return {
//       data: processedData,
//       componentMapping: componentCodeToName,
//       earningsComponents,
//       deductionComponents,
//       totalRecords: processedData.length
//     };
//   } catch (error) {
//     console.error("Excel data retrieval error", error);
//     throw new Error("Error retrieving payroll data for Excel export");
//   }
// };

// // ===============================
// // SERVICE - monthlyPayrollService.js
// // ===============================
// // Add this function to your existing monthlyPayrollService.js

// const ExcelJS = require('exceljs');
// const fs = require('fs');
// const path = require('path');

// const downloadPayrollExcel = async (search, employee_id, payroll_month, payroll_year) => {
//   try {
//     const result = await monthlyPayrollModel.getPayrollDataForExcel(
//       search,
//       employee_id,
//       payroll_month,
//       payroll_year
//     );

//     if (!result.data || result.data.length === 0) {
//       throw new CustomError("No payroll data found for the specified filters", 404);
//     }

//     // Create Excel workbook and worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Monthly Payroll Data');

//     // Define static columns
//     const staticColumns = [
//       // Employee Information
//       { header: 'Employee ID', key: 'employee_id', width: 12 },
//       { header: 'Employee Code', key: 'employee_code', width: 15 },
//       { header: 'Employee Name', key: 'employee_full_name', width: 25 },
//       { header: 'Designation', key: 'designation', width: 20 },
//       { header: 'Department', key: 'department', width: 20 },
//       { header: 'Location', key: 'location', width: 15 },
//       { header: 'Cost Center', key: 'cost_center_name', width: 18 },
//       { header: 'Join Date', key: 'join_date', width: 12 },
//       { header: 'NRC No', key: 'nrc_no', width: 15 },
//       { header: 'TPIN No', key: 'tpin_no', width: 15 },
//       { header: 'NAPSA No', key: 'napsa_no', width: 15 },
//       { header: 'NHIS No', key: 'nhis_no', width: 15 },
//       { header: 'Bank Account', key: 'bank_account', width: 18 },
//       { header: 'Bank Name', key: 'bank_name', width: 15 },
//       { header: 'Email', key: 'employee_email', width: 25 },

//       // Payroll Information
//       { header: 'Payroll Month', key: 'payroll_month', width: 12 },
//       { header: 'Payroll Year', key: 'payroll_year', width: 12 },
//       { header: 'Payroll Week', key: 'payroll_week', width: 12 },
//       { header: 'Start Date', key: 'payroll_start_date', width: 12 },
//       { header: 'End Date', key: 'payroll_end_date', width: 12 },
//       { header: 'Paid Days', key: 'payroll_paid_days', width: 10 },

//       // Currency
//       { header: 'Currency Code', key: 'currency_code', width: 10 },
//       { header: 'Currency Name', key: 'currency_name', width: 15 },

//       // Financial Summary
//       { header: 'Basic Salary', key: 'basic_salary', width: 15 },
//       { header: 'Total Earnings', key: 'total_earnings', width: 15 },
//       { header: 'Taxable Earnings', key: 'taxable_earnings', width: 15 },
//       { header: 'Tax Amount', key: 'tax_amount', width: 15 },
//       { header: 'Total Deductions', key: 'total_deductions', width: 15 },
//       { header: 'Net Pay', key: 'net_pay', width: 15 }
//     ];

//     // Add dynamic component columns
//     const dynamicColumns = [];

//     // Add earnings components
//     result.earningsComponents.forEach(componentCode => {
//       const componentName = result.componentMapping[componentCode] || `Component_${componentCode}`;
//       dynamicColumns.push({
//         header: `${componentName} (${componentCode})`,
//         key: `${componentName} (${componentCode})`,
//         width: 18
//       });
//     });

//     // Add deduction components
//     result.deductionComponents.forEach(componentCode => {
//       const componentName = result.componentMapping[componentCode] || `Component_${componentCode}`;
//       dynamicColumns.push({
//         header: `${componentName} (${componentCode})`,
//         key: `${componentName} (${componentCode})`,
//         width: 18
//       });
//     });

//     // Additional status and control columns
//     const additionalColumns = [
//       { header: 'Status', key: 'status', width: 10 },
//       { header: 'Processed', key: 'processed', width: 10 },
//       { header: 'Execution Date', key: 'execution_date', width: 15 },
//       { header: 'Pay Date', key: 'pay_date', width: 12 },
//       { header: 'Doc Date', key: 'doc_date', width: 12 },
//       { header: 'Processed On', key: 'processed_on', width: 15 },
//       { header: 'Approved', key: 'approved1', width: 10 },
//       { header: 'Approver ID', key: 'approver1_id', width: 12 },
//       { header: 'Project ID', key: 'project_id', width: 12 },
//       { header: 'Cost Center 1', key: 'cost_center1_id', width: 12 },
//       { header: 'Cost Center 2', key: 'cost_center2_id', width: 12 },
//       { header: 'Cost Center 3', key: 'cost_center3_id', width: 12 },
//       { header: 'Cost Center 4', key: 'cost_center4_id', width: 12 },
//       { header: 'Cost Center 5', key: 'cost_center5_id', width: 12 },
//       { header: 'JE Trans ID', key: 'je_transid', width: 12 },
//       { header: 'Remarks', key: 'remarks', width: 30 },
//       { header: 'Created By', key: 'createdby', width: 12 },
//       { header: 'Create Date', key: 'createdate', width: 15 },
//       { header: 'Updated By', key: 'updatedby', width: 12 },
//       { header: 'Update Date', key: 'updatedate', width: 15 },
//       { header: 'Log Instance', key: 'log_inst', width: 12 }
//     ];

//     // Combine all columns
//     const allColumns = [...staticColumns, ...dynamicColumns, ...additionalColumns];
//     worksheet.columns = allColumns;

//     // Style the header row
//     const headerRow = worksheet.getRow(1);
//     headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
//     headerRow.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FF366092' }
//     };
//     headerRow.height = 20;
//     headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

//     // Add data rows
//     result.data.forEach((row, index) => {
//       const dataRow = worksheet.addRow(row);

//       // Alternate row colors
//       if (index % 2 === 1) {
//         dataRow.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'FFF8F9FA' }
//         };
//       }
//     });

//     // Format currency columns
//     const currencyColumns = [
//       'basic_salary', 'total_earnings', 'taxable_earnings',
//       'tax_amount', 'total_deductions', 'net_pay'
//     ];

//     currencyColumns.forEach(colKey => {
//       const col = worksheet.getColumn(colKey);
//       if (col) {
//         col.numFmt = '#,##0.00';
//         col.alignment = { horizontal: 'right' };
//       }
//     });

//     // Format dynamic component columns (currency format)
//     [...result.earningsComponents, ...result.deductionComponents].forEach(componentCode => {
//       const componentName = result.componentMapping[componentCode] || `Component_${componentCode}`;
//       const col = worksheet.getColumn(`${componentName} (${componentCode})`);
//       if (col) {
//         col.numFmt = '#,##0.00';
//         col.alignment = { horizontal: 'right' };
//       }
//     });

//     // Format date columns
//     const dateColumns = [
//       'join_date', 'payroll_start_date', 'payroll_end_date',
//       'execution_date', 'pay_date', 'doc_date', 'processed_on',
//       'createdate', 'updatedate'
//     ];

//     dateColumns.forEach(colKey => {
//       const col = worksheet.getColumn(colKey);
//       if (col) {
//         col.numFmt = 'dd/mm/yyyy';
//         col.alignment = { horizontal: 'center' };
//       }
//     });

//     // Add borders to all cells
//     worksheet.eachRow((row, rowNumber) => {
//       row.eachCell((cell) => {
//         cell.border = {
//           top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
//           left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
//           bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
//           right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
//         };
//       });
//     });

//     // Auto-fit columns
//     worksheet.columns.forEach(column => {
//       if (column.header && column.header.length > column.width) {
//         column.width = column.header.length + 2;
//       }
//     });

//     // Generate filename with timestamp and filters
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
//     let filename = `Monthly_Payroll_${timestamp}`;

//     if (employee_id) filename += `_Emp${employee_id}`;
//     if (payroll_month) filename += `_M${String(payroll_month).padStart(2, '0')}`;
//     if (payroll_year) filename += `_Y${payroll_year}`;
//     if (search) filename += `_Search_${search.replace(/[^a-zA-Z0-9]/g, '_')}`;

//     filename += '.xlsx';

//     // Create file path
//     const filePath = path.join(__dirname, `../../exports/${filename}`);

//     // Ensure directory exists
//     if (!fs.existsSync(path.dirname(filePath))) {
//       fs.mkdirSync(path.dirname(filePath), { recursive: true });
//     }

//     // Write file
//     await workbook.xlsx.writeFile(filePath);

//     console.log(`Excel file created: ${filePath}`);

//     return {
//       filePath,
//       filename,
//       totalRecords: result.totalRecords,
//       componentMapping: result.componentMapping,
//       earningsCount: result.earningsComponents.length,
//       deductionsCount: result.deductionComponents.length
//     };

//   } catch (error) {
//     console.error("Excel generation error:", error);
//     throw new CustomError(`Failed to generate Excel file: ${error.message}`, 500);
//   }
// };

// // ===============================
// // CONTROLLER - monthlyPayrollController.js
// // ===============================
// // Add this function to your existing monthlyPayrollController.js

// const downloadPayrollExcel = async (req, res, next) => {
//   try {
//     const { search, employee_id, payroll_month, payroll_year } = req.query;

//     console.log('Excel download parameters:', {
//       search,
//       employee_id,
//       payroll_month,
//       payroll_year,
//       user: req.user?.id
//     });

//     // Log activity
//     await logActivity(
//       req.user.id,
//       'EXPORT',
//       'MONTHLY_PAYROLL_EXCEL',
//       `Excel export with filters: employee_id=${employee_id || 'all'}, month=${payroll_month || 'all'}, year=${payroll_year || 'all'}, search=${search || 'none'}`,
//       req.user.log_inst
//     );

//     const result = await monthlyPayrollService.downloadPayrollExcel(
//       search,
//       employee_id,
//       payroll_month,
//       payroll_year
//     );

//     console.log(`Excel file generated successfully: ${result.filename}`);
//     console.log(`Total records: ${result.totalRecords}, Earnings: ${result.earningsCount}, Deductions: ${result.deductionsCount}`);

//     // Set headers for file download
//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename="${result.filename}"`
//     );
//     res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
//     res.setHeader('Cache-Control', 'no-cache');

//     // Send file
//     res.sendFile(result.filePath, (err) => {
//       if (err) {
//         console.error('Error sending Excel file:', err);
//         return next(new CustomError('Failed to send Excel file', 500));
//       }

//       console.log(`Excel file sent successfully: ${result.filename}`);

//       // Clean up file after 10 minutes
//       setTimeout(() => {
//         fs.unlink(result.filePath, (unlinkErr) => {
//           if (unlinkErr) {
//             console.error('Error deleting Excel file:', unlinkErr);
//           } else {
//             console.log(`Deleted temporary Excel file: ${result.filePath}`);
//           }
//         });
//       }, 10 * 60 * 1000); // 10 minutes
//     });

//   } catch (error) {
//     console.error('Excel download controller error:', error);

//     // Log error activity
//     if (req.user?.id) {
//       await logActivity(
//         req.user.id,
//         'EXPORT_ERROR',
//         'MONTHLY_PAYROLL_EXCEL',
//         `Excel export failed: ${error.message}`,
//         req.user.log_inst
//       );
//     }

//     next(error);
//   }
// };

// // ===============================
// // ROUTES - Add to your routes file
// // ===============================

// // Add this route to your existing routes
// router.get(
//   "/monthly-payroll/download-excel",
//   authenticateToken,
//   monthlyPayrollController.downloadPayrollExcel
// );

// // ===============================
// // MODULE EXPORTS UPDATES
// // ===============================

// // Add to monthlyPayrollModel.js exports:
// module.exports = {
//   createMonthlyPayroll,
//   findMonthlyPayrollById,
//   updateMonthlyPayroll,
//   deleteMonthlyPayroll,
//   getAllMonthlyPayroll,
//   callMonthlyPayrollSP,
//   getComponentNames,
//   triggerMonthlyPayrollCalculationSP,
//   createOrUpdatePayrollBulk,
//   getGeneratedMonthlyPayroll,
//   downloadPayslipPDF,
//   getPayrollDataForExcel, // Add this new function
// };

// // Add to monthlyPayrollService.js exports:
// module.exports = {
//   createMonthlyPayroll,
//   findMonthlyPayrollById,
//   updateMonthlyPayroll,
//   deleteMonthlyPayroll,
//   getAllMonthlyPayroll,
//   callMonthlyPayrollSP,
//   getComponentNames,
//   triggerMonthlyPayrollCalculationSP,
//   createOrUpdatePayrollBulk,
//   getGeneratedMonthlyPayroll,
//   downloadPayslipPDF,
//   downloadPayrollExcel, // Add this new function
// };

// // Add to monthlyPayrollController.js exports:
// module.exports = {
//   createMonthlyPayroll,
//   findMonthlyPayroll,
//   updateMonthlyPayroll,
//   deleteMonthlyPayroll,
//   getAllMonthlyPayroll,
//   triggerMonthlyPayrollSP,
//   getComponentNames,
//   triggerMonthlyPayrollCalculationSP,
//   createOrUpdateMonthlyPayroll,
//   getGeneratedMonthlyPayroll,
//   downloadPayslipPDF,
//   downloadPayrollExcel, // Add this new function
// };

// // ===============================
// // PACKAGE INSTALLATION
// // ===============================
// /*
// Install required package:
// npm install exceljs

// Usage Examples:

// 1. Download all payroll data:
//    GET /monthly-payroll/download-excel

// 2. Download for specific employee:
//    GET /monthly-payroll/download-excel?employee_id=123

// 3. Download for specific month/year:
//    GET /monthly-payroll/download-excel?payroll_month=12&payroll_year=2023

// 4. Download with search:
//    GET /monthly-payroll/download-excel?search=John

// 5. Download with all filters:
//    GET /monthly-payroll/download-excel?employee_id=123&payroll_month=12&payroll_year=2023&search=active
// */
