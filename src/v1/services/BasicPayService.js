const { file } = require("pdfkit");
const BasicPayModel = require("../models/BasicPayModel");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
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

// const importFromExcel = async (rows) => {
//   return await BasicPayModel.importFromExcel(rows);
// };

// const importFromExcel = async (rows) => {
//   let created = 0;
//   let updated = 0;
//   let data = [];

//   for (const row of rows) {
//     // check required field
//     if (!row.employee_id) continue;

//     const existing =
//       await prisma.hrms_d_employee_pay_component_assignment_header.findFirst({
//         where: { employee_id: row.employee_id },
//       });

//     if (existing) {
//       const updatedRow =
//         await prisma.hrms_d_employee_pay_component_assignment_header.update({
//           where: { id: existing.id },
//           data: {
//             basic_pay: row.basic_pay,
//             hra: row.hra,
//             updatedby: row.createdby,
//           },
//         });
//       updated++;
//       data.push(updatedRow);
//     } else {
//       const newRow =
//         await prisma.hrms_d_employee_pay_component_assignment_header.create({
//           data: {
//             employee_id: row.employee_id,
//             effective_from: new Date(row.effective_from),
//             effective_to: new Date(row.effective_to),
//             createdby: userId,
//             hrms_d_employee_pay_component_assignment_line: {
//               create: row.lines.map((line, index) => ({
//                 line_num: line.line_num || index + 1, // ✅ ensure line_num is set
//                 component_code: line.component_code,
//                 amount: line.amount || 0, // ✅ avoid undefined
//               })),
//             },
//           },
//         });

//       created++;
//       data.push(newRow);
//     }
//   }

//   return { count: created + updated, created, updated, data };
// };

// const importFromExcel = async (rows, userId, logInst) => {
//   let created = 0;
//   let updated = 0;
//   let data = [];

//   for (const row of rows) {
//     if (!row.employee_id) continue;

//     // Validate required fields
//     if (!row.amount || isNaN(parseFloat(row.amount))) {
//       console.warn(
//         `Skipping row for employee ${row.employee_id}: amount is required and must be a valid number`
//       );
//       continue;
//     }

//     const existing =
//       await prisma.hrms_d_employee_pay_component_assignment_header.findFirst({
//         where: { employee_id: Number(row.employee_id) },
//       });

//     if (existing) {
//       // Update existing record
//       const updatedRow =
//         await prisma.hrms_d_employee_pay_component_assignment_header.update({
//           where: { id: existing.id },
//           data: {
//             effective_from: row.effective_from
//               ? new Date(row.effective_from)
//               : existing.effective_from,
//             effective_to: row.effective_to
//               ? new Date(row.effective_to)
//               : existing.effective_to,
//             department_id: row.department_id
//               ? Number(row.department_id)
//               : existing.department_id,
//             branch_id: row.branch_id
//               ? Number(row.branch_id)
//               : existing.branch_id,
//             position_id: row.position_id
//               ? Number(row.position_id)
//               : existing.position_id,
//             pay_grade_id: row.pay_grade_id
//               ? Number(row.pay_grade_id)
//               : existing.pay_grade_id,
//             pay_grade_level: row.pay_grade_level
//               ? Number(row.pay_grade_level)
//               : existing.pay_grade_level,
//             allowance_group: row.allowance_group || existing.allowance_group,
//             work_life_entry: row.work_life_entry
//               ? Number(row.work_life_entry)
//               : existing.work_life_entry,
//             status: row.status || existing.status,
//             remarks: row.remarks || existing.remarks,
//             updatedby: userId,
//             updatedate: new Date(),
//           },
//         });
//       updated++;
//       data.push(updatedRow);
//     } else {
//       const newRow =
//         await prisma.hrms_d_employee_pay_component_assignment_header.create({
//           data: {
//             employee_id: Number(row.employee_id),
//             effective_from: row.effective_from
//               ? new Date(row.effective_from)
//               : new Date(),
//             effective_to: row.effective_to ? new Date(row.effective_to) : null,
//             department_id: row.department_id ? Number(row.department_id) : null,
//             branch_id: row.branch_id ? Number(row.branch_id) : null,
//             position_id: row.position_id ? Number(row.position_id) : null,
//             pay_grade_id: row.pay_grade_id ? Number(row.pay_grade_id) : null,
//             pay_grade_level: row.pay_grade_level
//               ? Number(row.pay_grade_level)
//               : null,
//             allowance_group: row.allowance_group || null,
//             work_life_entry: row.work_life_entry
//               ? Number(row.work_life_entry)
//               : null,
//             status: row.status || "Active",
//             remarks: row.remarks || null,
//             createdby: userId,
//             log_inst: logInst,
//             createdate: new Date(),
//             hrms_d_employee_pay_component_assignment_line: {
//               create: [
//                 {
//                   line_num: row.line_num ? Number(row.line_num) : 1,
//                   pay_component_id: Number(row.pay_component_id),
//                   amount: parseFloat(row.amount),
//                   type_value: row.type_value ? parseFloat(row.type_value) : 0,
//                   currency_id: row.currency_id ? Number(row.currency_id) : null,
//                   is_taxable: row.is_taxable?.toLowerCase() === "y" ? "Y" : "N",
//                   is_recurring:
//                     row.is_recurring?.toLowerCase() === "y" ? "Y" : "N",
//                   is_worklife_related:
//                     row.is_worklife_related?.toLowerCase() === "y" ? "Y" : "N",
//                   is_grossable:
//                     row.is_grossable?.toLowerCase() === "y" ? "Y" : "N",
//                   remarks: row.remarks_1 || null,
//                   tax_code_id: row.tax_code_id ? Number(row.tax_code_id) : null,
//                   gl_account_id: row.gl_account_id
//                     ? Number(row.gl_account_id)
//                     : null,
//                   factor: row.factor ? parseFloat(row.factor) : null,
//                   payable_glaccount_id: row.payable_glaccount_id
//                     ? Number(row.payable_glaccount_id)
//                     : null,
//                   component_type: row.component_type || "O",
//                   project_id: row.project_id ? Number(row.project_id) : null,
//                   cost_center1_id: row.cost_center1_id
//                     ? Number(row.cost_center1_id)
//                     : null,
//                   cost_center2_id: row.cost_center2_id
//                     ? Number(row.cost_center2_id)
//                     : null,
//                   cost_center3_id: row.cost_center3_id
//                     ? Number(row.cost_center3_id)
//                     : null,
//                   cost_center4_id: row.cost_center4_id
//                     ? Number(row.cost_center4_id)
//                     : null,
//                   cost_center5_id: row.cost_center5_id
//                     ? Number(row.cost_center5_id)
//                     : null,
//                   column_order: row.column_order
//                     ? Number(row.column_order)
//                     : null,
//                   createdby: userId,
//                   createdate: new Date(),
//                 },
//               ],
//             },
//           },
//         });

//       created++;
//       data.push(newRow);
//     }
//   }

//   return { count: created + updated, created, updated, data };
// };

const importFromExcel = async (rows, userId, logInst) => {
  let created = 0;
  let updated = 0;
  let data = [];

  const latestRowsMap = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.employee_id) continue;

    latestRowsMap[row.employee_id] = row;
  }

  console.log(
    `Processing ${Object.keys(latestRowsMap).length} unique employees from ${
      rows.length
    } total rows`
  );

  for (const [employeeId, row] of Object.entries(latestRowsMap)) {
    try {
      if (!row.amount || isNaN(parseFloat(row.amount))) {
        console.warn(
          `Skipping employee ${employeeId}: amount is required and must be a valid number`
        );
        continue;
      }

      const existing =
        await prisma.hrms_d_employee_pay_component_assignment_header.findFirst({
          where: { employee_id: Number(employeeId) },
        });

      if (existing) {
        const updatedRow =
          await prisma.hrms_d_employee_pay_component_assignment_header.update({
            where: { id: existing.id },
            data: {
              effective_from: row.effective_from
                ? new Date(row.effective_from)
                : existing.effective_from,
              effective_to: row.effective_to
                ? new Date(row.effective_to)
                : existing.effective_to,
              department_id: row.department_id
                ? Number(row.department_id)
                : existing.department_id,
              branch_id: row.branch_id
                ? Number(row.branch_id)
                : existing.branch_id,
              position_id: row.position_id
                ? Number(row.position_id)
                : existing.position_id,
              pay_grade_id: row.pay_grade_id
                ? Number(row.pay_grade_id)
                : existing.pay_grade_id,
              pay_grade_level: row.pay_grade_level
                ? Number(row.pay_grade_level)
                : existing.pay_grade_level,
              allowance_group: row.allowance_group || existing.allowance_group,
              work_life_entry: row.work_life_entry
                ? Number(row.work_life_entry)
                : existing.work_life_entry,
              status: row.status || existing.status,
              remarks: row.remarks || existing.remarks,
              updatedby: userId,
              updatedate: new Date(),
            },
          });
        updated++;
        data.push(updatedRow);
        console.log(`✅ Updated employee ${employeeId}`);
      } else {
        const newRow =
          await prisma.hrms_d_employee_pay_component_assignment_header.create({
            data: {
              employee_id: Number(employeeId),
              effective_from: row.effective_from
                ? new Date(row.effective_from)
                : new Date(),
              effective_to: row.effective_to
                ? new Date(row.effective_to)
                : null,
              department_id: row.department_id
                ? Number(row.department_id)
                : null,
              branch_id: row.branch_id ? Number(row.branch_id) : null,
              position_id: row.position_id ? Number(row.position_id) : null,
              pay_grade_id: row.pay_grade_id ? Number(row.pay_grade_id) : null,
              pay_grade_level: row.pay_grade_level
                ? Number(row.pay_grade_level)
                : null,
              allowance_group: row.allowance_group || null,
              work_life_entry: row.work_life_entry
                ? Number(row.work_life_entry)
                : null,
              status: row.status || "Active",
              remarks: row.remarks || null,
              createdby: userId,
              log_inst: logInst,
              createdate: new Date(),
              hrms_d_employee_pay_component_assignment_line: {
                create: [
                  {
                    line_num: row.line_num ? Number(row.line_num) : 1,
                    pay_component_id: Number(row.pay_component_id),
                    amount: parseFloat(row.amount),
                    type_value: row.type_value ? parseFloat(row.type_value) : 0,
                    currency_id: row.currency_id
                      ? Number(row.currency_id)
                      : null,
                    is_taxable:
                      row.is_taxable?.toLowerCase() === "y" ? "Y" : "N",
                    is_recurring:
                      row.is_recurring?.toLowerCase() === "y" ? "Y" : "N",
                    is_worklife_related:
                      row.is_worklife_related?.toLowerCase() === "y"
                        ? "Y"
                        : "N",
                    is_grossable:
                      row.is_grossable?.toLowerCase() === "y" ? "Y" : "N",
                    remarks: row.remarks_1 || null,
                    tax_code_id: row.tax_code_id
                      ? Number(row.tax_code_id)
                      : null,
                    gl_account_id: row.gl_account_id
                      ? Number(row.gl_account_id)
                      : null,
                    factor: row.factor ? parseFloat(row.factor) : null,
                    payable_glaccount_id: row.payable_glaccount_id
                      ? Number(row.payable_glaccount_id)
                      : null,
                    component_type: row.component_type || "O",
                    project_id: row.project_id ? Number(row.project_id) : null,
                    cost_center1_id: row.cost_center1_id
                      ? Number(row.cost_center1_id)
                      : null,
                    cost_center2_id: row.cost_center2_id
                      ? Number(row.cost_center2_id)
                      : null,
                    cost_center3_id: row.cost_center3_id
                      ? Number(row.cost_center3_id)
                      : null,
                    cost_center4_id: row.cost_center4_id
                      ? Number(row.cost_center4_id)
                      : null,
                    cost_center5_id: row.cost_center5_id
                      ? Number(row.cost_center5_id)
                      : null,
                    column_order: row.column_order
                      ? Number(row.column_order)
                      : null,
                    createdby: userId,
                    createdate: new Date(),
                  },
                ],
              },
            },
          });

        created++;
        data.push(newRow);
        console.log(`Created employee ${employeeId}`);
      }
    } catch (error) {
      console.error(` Error processing employee ${employeeId}:`, error.message);
    }
  }

  return {
    count: created + updated,
    created,
    updated,
    data,
    processed_employees: Object.keys(latestRowsMap).length,
    total_input_rows: rows.length,
  };
};

const previewExcel = async (fileBuffer) => {
  return await BasicPayModel.previewExcel(fileBuffer);
};

const downloadPreviewExcel = async (fileBuffer) => {
  return await BasicPayModel.downloadPreviewExcel(fileBuffer);
};

const downloadSampleExcel = async () => {
  return await BasicPayModel.downloadSampleExcel();
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
