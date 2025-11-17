const { file } = require("pdfkit");
const BasicPayModel = require("../models/BasicPayModel");

const XLSX = require("xlsx");
const { getPrisma } = require("../../config/prismaContext.js");
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
    employee_name: "Test Employee",
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
    "employee_name",
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
