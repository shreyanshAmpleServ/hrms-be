const { file } = require("pdfkit");
const BasicPayModel = require("../models/BasicPayModel");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const XLSX = require("xlsx");
const createBasicPay = async (data) => {
  return await BasicPayModel.createBasicPay(data);
};

const findBasicPayById = async (id) => {
  return await BasicPayModel.findBasicPayById(id);
};

// const findDealsByStatus = async (status) => {
//   return await BasicPayModel.findDealsByStatus(status);
// };

const updateBasicPay = async (id, data) => {
  return await BasicPayModel.updateBasicPay(id, data);
};

const deleteBasicPay = async (id) => {
  return await BasicPayModel.deleteBasicPay(id);
};

const getAllBasicPay = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status,
  employee_id
) => {
  return await BasicPayModel.getAllBasicPay(
    page,
    size,
    search,
    startDate,
    endDate,
    status,
    employee_id
  );
};

// const importFromExcel = async (fileBuffer) => {
//   const workbook = XLSX.read(fileBuffer, { type: "buffer" });
//   const sheetName = workbook.SheetNames[0];
//   const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//   const payComponents = await BasicPayModel.getAllPayComponents();

//   const componentMap = {};
//   payComponents.forEach(
//     (c) => (componentMap[`${c.component_name} (${c.component_code})`] = c.id)
//   );

//   const results = [];

//   for (const row of sheetData) {
//     const headerData = {
//       employee_id: row.employee_id,
//       effective_from: new Date(row.effective_from),
//       effective_to: new Date(row.effective_to),
//       department_id: row.department_id,
//       branch_id: row.branch_id,
//       position_id: row.position_id,
//       pay_grade_id: row.pay_grade_id,
//       pay_grade_level: row.pay_grade_level,
//       allowance_group: row.allowance_group,
//       work_life_entry: row.work_life_entry,
//       status: row.status,
//       remarks: row.remarks,
//       createdby: 1,
//       log_inst: 1,
//     };

//     const payLines = Object.keys(row)
//       .filter((key) => componentMap[key] && row[key] != null)
//       .map((key, index) => ({
//         line_num: index + 1,
//         pay_component_id: componentMap[key],
//         amount: Number(row[key]),
//         createdby: 1,
//         log_inst: 1,
//       }));

//     const created = await BasicPayModel.createOrUpdateBasicPay(
//       headerData,
//       payLines
//     );
//     results.push(created);
//   }

//   return {
//     count: results.length,
//     data: results,
//   };
// };

// without Gl account , cost center(1-5)
const importFromExcel = async (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const payComponents = await BasicPayModel.getAllPayComponents();
  const componentMap = {};
  payComponents.forEach(
    (c) => (componentMap[`${c.component_name} (${c.component_code})`] = c.id)
  );

  const results = [];

  for (const row of sheetData) {
    const headerData = {
      employee_id: row.employee_id,
      effective_from: row.effective_from,
      effective_to: row.effective_to,
      department_id: row.department_id,
      branch_id: row.branch_id,
      position_id: row.position_id,
      pay_grade_id: row.pay_grade_id,
      pay_grade_level: row.pay_grade_level,
      allowance_group: row.allowance_group,
      work_life_entry: row.work_life_entry,
      status: row.status,
      remarks: row.remarks,
      createdby: 1,
      log_inst: 1,
    };

    const payLines = Object.keys(row)
      .filter((key) => componentMap[key] && row[key] != null)
      .map((key, index) => ({
        line_num: index + 1,
        pay_component_id: componentMap[key],
        amount: Number(row[key]),
        createdby: 1,
        log_inst: 1,
      }));

    const record = await BasicPayModel.createOrUpdateBasicPay(
      headerData,
      payLines
    );
    results.push(record);
  }

  return { count: results.length, data: results };
};

// With Gl account , cost center(1-5)
// const importFromExcel = async (fileBuffer) => {
//   const workbook = XLSX.read(fileBuffer, { type: "buffer" });
//   const sheetName = workbook.SheetNames[0];
//   const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//   const components = await prisma.hrms_m_pay_component.findMany({
//     select: {
//       id: true,
//       component_code: true,
//       component_name: true,
//       factor: true,
//       pay_component_cost_center1: { select: { id: true } },
//       pay_component_cost_center2: { select: { id: true } },
//       pay_component_cost_center3: { select: { id: true } },
//       pay_component_cost_center4: { select: { id: true } },
//       pay_component_cost_center5: { select: { id: true } },
//       pay_component_project: { select: { id: true } },
//       pay_component_tax: { select: { id: true } },
//       // Add GL accounts if needed: gl_account_id/payable_glaccount_id
//     },
//   });

//   // Map component code to its defaults
//   const componentMap = {};
//   components.forEach((c) => {
//     componentMap[`${c.component_name} (${c.component_code})`] = {
//       id: c.id,
//       factor: c.factor,
//       cost_center1: c.pay_component_cost_center1?.cost_center_code || null,
//       cost_center2: c.pay_component_cost_center2?.cost_center_code || null,
//       cost_center3: c.pay_component_cost_center3?.cost_center_code || null,
//       cost_center4: c.pay_component_cost_center4?.cost_center_code || null,
//       cost_center5: c.pay_component_cost_center5?.cost_center_code || null,
//       project: c.pay_component_project?.id || null,
//       tax_code: c.pay_component_tax?.id || null,
//     };
//   });

//   const results = [];

//   for (const row of sheetData) {
//     // Header data
//     const headerData = {
//       employee_id: row.employee_id,
//       effective_from: row.effective_from,
//       effective_to: row.effective_to,
//       department_id: row.department_id,
//       branch_id: row.branch_id,
//       position_id: row.position_id,
//       pay_grade_id: row.pay_grade_id,
//       pay_grade_level: row.pay_grade_level,
//       allowance_group: row.allowance_group,
//       work_life_entry: row.work_life_entry,
//       status: row.status,
//       remarks: row.remarks,
//       createdby: 1,
//       log_inst: 1,
//     };

//     // Pay lines with auto-filled fields
//     const payLines = Object.keys(row)
//       .filter((key) => componentMap[key] && row[key] != null)
//       .map((key, index) => {
//         const defaults = componentMap[key];
//         return {
//           line_num: index + 1,
//           pay_component_id: defaults.id,
//           amount: Number(row[key]),
//           project: defaults.project,
//           tax_code: defaults.tax_code,
//           cost_center1: defaults.cost_center1,
//           cost_center2: defaults.cost_center2,
//           cost_center3: defaults.cost_center3,
//           cost_center4: defaults.cost_center4,
//           cost_center5: defaults.cost_center5,
//           createdby: 1,
//           log_inst: 1,
//         };
//       });

//     // Create or update payroll record
//     const record = await BasicPayModel.createOrUpdateBasicPay(
//       headerData,
//       payLines
//     );
//     results.push(record);
//   }

//   return { count: results.length, data: results };
// };

const previewExcel = async (fileBuffer) => {
  return await BasicPayModel.previewExcel(fileBuffer);
};

const downloadPreviewExcel = async (fileBuffer) => {
  return await BasicPayModel.downloadPreviewExcel(fileBuffer);
};

const downloadSampleExcel = async () => {
  const payComponents = await BasicPayModel.getAllPayComponents();

  const componentHeaders = payComponents.map(
    (c) => `${c.component_name} (${c.component_code})`
  );

  const sampleRow = {
    employee_id: "12345",
    effective_from: "2025-01-01",
    effective_to: "2025-12-31",
    department_id: "1",
    branch_id: "1",
    position_id: "1",
    pay_grade_id: "1",
    pay_grade_level: "1",
    allowance_group: "A1",
    work_life_entry: "0",
    status: "Active",
    remarks: "Sample remark",
  };

  componentHeaders.forEach((header) => {
    sampleRow[header] = 1000;
  });

  const headers = [
    "employee_id",
    "effective_from",
    "effective_to",
    "department_id",
    "branch_id",
    "position_id",
    "pay_grade_id",
    "pay_grade_level",
    "allowance_group",
    "work_life_entry",
    "status",
    "remarks",
    ...componentHeaders,
  ];

  const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sample Template");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
};

module.exports = {
  createBasicPay,
  findBasicPayById,
  updateBasicPay,
  getAllBasicPay,
  deleteBasicPay,
  importFromExcel,
  previewExcel,
  downloadPreviewExcel,
  downloadSampleExcel,
};
