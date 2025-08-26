// // controllers
// const importFromExcel = async (req, res, next) => {
//   try {
//     if (!req.file) throw new CustomError("No file uploaded", 400);

//     const workbook = XLSX.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     const reqData = sheetData.map((row) => ({
//       ...row,
//       createdby: req.user.id,
//       log_inst: req.user.log_inst,
//     }));

//     const result = await BasicPayService.importFromExcel(reqData);

//     res
//       .status(201)
//       .success(
//         `${result.count} employee pay assignments imported successfully`,
//         result.data
//       );
//   } catch (error) {
//     next(error);
//   }
// };

// // Model
// // models/BasicPayModel.js
// const importFromExcel = async (rows) => {
//   let createdRecords = [];

//   const result = await prisma.$transaction(async (prisma) => {
//     // Group rows by employee_id + effective_from
//     const grouped = {};
//     for (const row of rows) {
//       const key = `${row.employee_id}-${row.effective_from}`;
//       if (!grouped[key]) grouped[key] = { header: row, lines: [] };
//       grouped[key].lines.push(row);
//     }

//     for (const key of Object.keys(grouped)) {
//       const { header, lines } = grouped[key];

//       if (!header.employee_id)
//         throw new CustomError("Employee ID missing", 400);
//       if (!header.effective_from)
//         throw new CustomError(
//           `Effective from missing for employee ${header.employee_id}`,
//           400
//         );

//       // Check duplicate
//       const existing =
//         await prisma.hrms_d_employee_pay_component_assignment_header.findFirst({
//           where: { employee_id: Number(header.employee_id) },
//         });
//       if (existing) continue; // skip duplicate (or change to update if required)

//       // Create header
//       const createdHeader =
//         await prisma.hrms_d_employee_pay_component_assignment_header.create({
//           data: {
//             ...serializeHeaders(header),
//             createdby: header.createdby || 1,
//             log_inst: header.log_inst || 1,
//             createdate: new Date(),
//           },
//         });

//       // Map component_code → pay_component_id
//       const payComponents = await prisma.hrms_m_pay_component.findMany({
//         where: {
//           component_code: { in: lines.map((l) => l.component_code) },
//         },
//         select: { id: true, component_code: true },
//       });
//       const codeMap = Object.fromEntries(
//         payComponents.map((pc) => [pc.component_code, pc.id])
//       );

//       const lineDatas = lines.map((line, i) => ({
//         line_num: i + 1,
//         pay_component_id: codeMap[line.component_code],
//         amount: Number(line.amount) || 0,
//         is_taxable: line.is_taxable || "Y",
//         is_recurring: line.is_recurring || "Y",
//         component_type: line.component_type || "O",
//         parent_id: createdHeader.id,
//         createdby: header.createdby || 1,
//         createdate: new Date(),
//       }));

//       await prisma.hrms_d_employee_pay_component_assignment_line.createMany({
//         data: lineDatas,
//       });

//       createdRecords.push(createdHeader);
//     }

//     return { count: createdRecords.length, data: createdRecords };
//   });

//   return result;
// };

// // service
// // services/BasicPayService.js
// const BasicPayModel = require("../models/BasicPayModel");

// const importFromExcel = async (rows) => {
//   return await BasicPayModel.importFromExcel(rows);
// };

// module.exports = {
//   ...otherServices,
//   importFromExcel,
// };

// // routes
// // routes/BasicPayRoutes.js
// router.post(
//   "/basic-pay/import",
//   authenticateToken,
//   upload.single("file"), // using your UploadFileMiddleware
//   BasicPayController.importFromExcel
// );
