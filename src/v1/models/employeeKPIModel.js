const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { createRequest, getWorkflowForRequest } = require("./requestsModel");

if (!prisma) {
  throw new Error("Prisma client failed to initialize");
}

const serializeEmployeeKPIData = (data, defaultEmploymentType = null) => {
  const serialized = {
    employee_id: Number(data.employee_id),
    reviewer_id: Number(data.reviewer_id),
    review_date: data.review_date ? new Date(data.review_date) : new Date(),
    review_remarks: data.review_remarks || "",
    next_review_date: data.next_review_date
      ? new Date(data.next_review_date)
      : null,
    employment_type: data.employment_type || defaultEmploymentType || null,
    contract_expiry_date: data.contract_expiry_date
      ? new Date(data.contract_expiry_date)
      : null,
    employment_remarks: data.employment_remarks || "",
    rating: data.rating || 0,
    revise_component_assignment:
      data.revise_component_assignment === true ||
      data.revise_component_assignment === "Y"
        ? "Y"
        : "N",
    last_kpi_id: data.last_kpi_id ? Number(data.last_kpi_id) : null,
  };
  if (data.status !== undefined) {
    serialized.status = data.status;
  }
  return serialized;
};

const approveKPIInTransaction = async (tx, kpiId, approverId) => {
  const kpi = await tx.hrms_d_employee_kpi.findUnique({
    where: { id: Number(kpiId) },
    include: {
      kpi_contents: true,
      kpi_component_assignment: {
        include: { kpi_component_lines: true },
      },
      kpi_attachments: true,
    },
  });

  if (!kpi) {
    throw new CustomError("KPI not found", 404);
  }

  await tx.hrms_d_employee_kpi.update({
    where: { id: Number(kpiId) },
    data: { status: "A", updatedate: new Date() },
  });

  await tx.hrms_d_employee_kpi.updateMany({
    where: {
      employee_id: kpi.employee_id,
      id: { not: Number(kpiId) },
      status: "A",
    },
    data: { status: "Inactive", updatedate: new Date() },
  });

  const updateEmployeeData = {};
  if (kpi.employment_type)
    updateEmployeeData.employment_type = kpi.employment_type;
  if (kpi.kpi_component_assignment?.department_id) {
    updateEmployeeData.department_id =
      kpi.kpi_component_assignment.department_id;
  }
  if (kpi.kpi_component_assignment?.designation_id) {
    updateEmployeeData.designation_id =
      kpi.kpi_component_assignment.designation_id;
  }
  if (kpi.kpi_component_assignment?.position) {
    updateEmployeeData.work_location = kpi.kpi_component_assignment.position;
  }

  if (Object.keys(updateEmployeeData).length > 0) {
    await tx.hrms_d_employee.update({
      where: { id: kpi.employee_id },
      data: updateEmployeeData,
    });
  }

  if (kpi.revise_component_assignment === "Y" && kpi.kpi_component_assignment) {
    const newComponentAssignment =
      await tx.hrms_d_employee_pay_component_assignment_header.create({
        data: {
          employee_id: kpi.employee_id,
          effective_from:
            kpi.kpi_component_assignment.effective_from || new Date(),
          effective_to: kpi.kpi_component_assignment.effective_to,
          department_id: kpi.kpi_component_assignment.department_id,
          position_id: null,
          status: "Active",
          remarks: `Created from Employee KPI #${kpi.id}`,
          createdby: approverId,
          createdate: new Date(),
        },
      });

    let lineNum = 1;
    for (const line of kpi.kpi_component_assignment.kpi_component_lines) {
      await tx.hrms_d_employee_pay_component_assignment_line.create({
        data: {
          parent_id: newComponentAssignment.id,
          line_num: lineNum++,
          pay_component_id: line.pay_component_id,
          amount: line.amount,
          type_value: line.amount,
          is_taxable: "Y",
          is_recurring: "Y",
          component_type: "O",
          createdby: approverId,
          createdate: new Date(),
        },
      });
    }
  }

  await tx.hrms_d_employee_kpi_attachments.updateMany({
    where: { employee_kpi_id: Number(kpiId) },
    data: { status: "Verified" },
  });

  for (const attachment of kpi.kpi_attachments) {
    await tx.hrms_d_document_upload.create({
      data: {
        employee_id: kpi.employee_id,
        document_type: attachment.kpi_attachment_doc_type?.name || "",
        document_path: attachment.attachment_url || "",
        document_number: attachment.document_name || "",
        issued_date: attachment.issue_date,
        expiry_date: attachment.expiry_date,
        is_mandatory: "Y",
        document_owner_type: "employee",
        document_owner_id: kpi.employee_id,
        createdby: approverId,
        createdate: new Date(),
      },
    });
  }
};

// const createEmployeeKPI = async (data) => {
//   try {
//     const reviewer = await prisma.hrms_d_employee.findUnique({
//       where: { id: Number(data.reviewer_id) },
//       select: {
//         department_id: true,
//         designation_id: true,
//       },
//     });

//     const { workflow: workflowSteps } = await getWorkflowForRequest(
//       "kpi_approval",
//       reviewer?.department_id,
//       reviewer?.designation_id
//     );

//     const needsWorkflow = workflowSteps && workflowSteps.length > 0;
//     const initialStatus = needsWorkflow ? "P" : "A";

//     console.log(
//       `KPI Workflow Check: needsWorkflow=${needsWorkflow}, initialStatus=${initialStatus}`
//     );

//     const kpiHeaderId = await prisma.$transaction(
//       async (tx) => {
//         const employee = await tx.hrms_d_employee.findUnique({
//           where: { id: Number(data.employee_id) },
//           select: { employment_type: true },
//         });

//         const lastKPI = await tx.hrms_d_employee_kpi.findFirst({
//           where: {
//             employee_id: Number(data.employee_id),
//             status: "A",
//           },
//           orderBy: { createdate: "desc" },
//           include: {
//             kpi_contents: true,
//           },
//         });

//         const contents = data.contents || [];
//         let totalWeightedAchieved = 0;
//         let totalWeightage = 0;

//         const validContents = contents.filter((content) => {
//           if (!content || !content.kpi_name || content.kpi_name.trim() === "") {
//             return false;
//           }
//           const drawingType =
//             content.kpi_drawing_type || "Active for Current & Next KPI";
//           return (
//             drawingType === "Active for Current & Next KPI" ||
//             drawingType === "Active for Next KPI"
//           );
//         });

//         validContents.forEach((item) => {
//           const targetPoint = Number(item.target_point) || 0;
//           const achievedPoint = Number(item.achieved_point) || 0;
//           const weightage = Number(item.weightage_percentage) || 0;

//           totalWeightage += weightage;

//           if (targetPoint > 0) {
//             const achievedPercent = (achievedPoint / targetPoint) * 100;
//             totalWeightedAchieved += (achievedPercent * weightage) / 100;
//           }
//         });

//         const rating =
//           totalWeightage > 0 ? (totalWeightedAchieved / totalWeightage) * 5 : 0;

//         const serializedData = serializeEmployeeKPIData(
//           data,
//           employee?.employment_type
//         );
//         const { status: _, ...dataWithoutStatus } = serializedData;
//         const kpiHeader = await tx.hrms_d_employee_kpi.create({
//           data: {
//             ...dataWithoutStatus,
//             rating: rating,
//             last_kpi_id: lastKPI?.id || null,
//             status: initialStatus,
//             createdby: data.createdby || 1,
//             createdate: new Date(),
//             log_inst: data.log_inst || 1,
//           },
//         });

//         if (contents.length > 0) {
//           const filteredContents = lastKPI
//             ? contents.filter((content) => {
//                 const lastKpiContent = lastKPI.kpi_contents.find(
//                   (k) => k.kpi_name === content.kpi_name
//                 );
//                 return (
//                   !lastKpiContent ||
//                   lastKpiContent.kpi_drawing_type !== "Inactive for Next"
//                 );
//               })
//             : contents;

//           for (const content of filteredContents) {
//             const targetPoint = Number(content.target_point) || 0;
//             const achievedPoint = Number(content.achieved_point) || 0;
//             const achievedPercent =
//               targetPoint > 0 ? (achievedPoint / targetPoint) * 100 : 0;

//             await tx.hrms_d_employee_kpi_contents.create({
//               data: {
//                 employee_kpi_id: kpiHeader.id,
//                 kpi_name: content.kpi_name || "",
//                 kpi_remarks: content.kpi_remarks || "",
//                 weightage_percentage: Number(content.weightage_percentage) || 0,
//                 target_point: targetPoint,
//                 achieved_point: achievedPoint,
//                 achieved_percentage: achievedPercent,
//                 kpi_drawing_type:
//                   content.kpi_drawing_type || "Active for Current & Next KPI",
//                 target_point_for_next_kpi:
//                   Number(content.target_point_for_next_kpi) || 0,
//                 weightage_percentage_for_next_kpi:
//                   Number(content.weightage_percentage_for_next_kpi) || 0,
//                 createdby: data.createdby || 1,
//                 createdate: new Date(),
//               },
//             });
//           }
//         }

//         if (
//           data.revise_component_assignment === "Y" &&
//           data.component_assignment
//         ) {
//           const lastComponentAssignment =
//             await tx.hrms_d_employee_pay_component_assignment_header.findFirst({
//               where: {
//                 employee_id: Number(data.employee_id),
//                 status: "Active",
//               },
//               orderBy: { createdate: "desc" },
//               include: {
//                 hrms_d_employee_pay_component_assignment_line: true,
//               },
//             });

//           const componentAssignment =
//             await tx.hrms_d_employee_kpi_component_assignment.create({
//               data: {
//                 employee_kpi_id: kpiHeader.id,
//                 header_payroll_rule: (() => {
//                   const rule = data.component_assignment.header_payroll_rule;
//                   if (
//                     rule &&
//                     rule !== "Biometric/Manual Attendance" &&
//                     rule !== "Standard"
//                   ) {
//                     throw new CustomError(
//                       'Payroll Rule must be either "Biometric/Manual Attendance" or "Standard"',
//                       400
//                     );
//                   }
//                   return rule || "Standard";
//                 })(),
//                 effective_from: data.component_assignment.effective_from
//                   ? new Date(data.component_assignment.effective_from)
//                   : new Date(),
//                 effective_to: data.component_assignment.effective_to
//                   ? new Date(data.component_assignment.effective_to)
//                   : null,
//                 status: "P",
//                 last_component_assignment_id:
//                   lastComponentAssignment?.id || null,
//                 change_percentage:
//                   Number(data.component_assignment.change_percentage) || 0,
//                 department_id: data.component_assignment.department_id
//                   ? Number(data.component_assignment.department_id)
//                   : null,
//                 designation_id: data.component_assignment.designation_id
//                   ? Number(data.component_assignment.designation_id)
//                   : null,
//                 position: data.component_assignment.position || "",
//                 successor_id: data.component_assignment.successor_id
//                   ? Number(data.component_assignment.successor_id)
//                   : null,
//                 createdby: data.createdby || 1,
//                 createdate: new Date(),
//               },
//             });

//           const componentLines =
//             data.component_assignment.component_lines || [];
//           const linesToProcess =
//             componentLines.length > 0
//               ? componentLines
//               : (
//                   lastComponentAssignment?.hrms_d_employee_pay_component_assignment_line ||
//                   []
//                 ).map((l) => ({
//                   pay_component_id: l.pay_component_id,
//                   amount: l.amount,
//                 }));

//           for (const line of linesToProcess) {
//             let amount = Number(line.amount) || 0;

//             if (!line.amount && lastComponentAssignment) {
//               const lastLine =
//                 lastComponentAssignment.hrms_d_employee_pay_component_assignment_line.find(
//                   (l) => l.pay_component_id === Number(line.pay_component_id)
//                 );
//               if (lastLine) {
//                 amount = Number(lastLine.amount);
//               }
//             }

//             if (data.component_assignment.change_percentage) {
//               const changePercent =
//                 Number(data.component_assignment.change_percentage) / 100;
//               amount = amount * (1 + changePercent);
//             }

//             await tx.hrms_d_employee_kpi_component_lines.create({
//               data: {
//                 component_assignment_id: componentAssignment.id,
//                 pay_component_id: Number(line.pay_component_id),
//                 amount: amount,
//                 createdby: data.createdby || 1,
//                 createdate: new Date(),
//               },
//             });
//           }
//         }

//         if (data.attachments && data.attachments.length > 0) {
//           for (const attachment of data.attachments) {
//             await tx.hrms_d_employee_kpi_attachments.create({
//               data: {
//                 employee_kpi_id: kpiHeader.id,
//                 document_type_id: attachment.document_type_id
//                   ? Number(attachment.document_type_id)
//                   : null,
//                 document_name: attachment.document_name || "",
//                 issue_date: attachment.issue_date
//                   ? new Date(attachment.issue_date)
//                   : new Date(),
//                 expiry_date: attachment.expiry_date
//                   ? new Date(attachment.expiry_date)
//                   : null,
//                 status: "P",
//                 remarks: attachment.remarks || "",
//                 attachment_url: attachment.attachment_url || "",
//                 createdby: data.createdby || 1,
//                 createdate: new Date(),
//               },
//             });
//           }
//         }

//         if (!needsWorkflow) {
//           console.log(`Auto-approving KPI ${kpiHeader.id} (no workflow found)`);
//           await approveKPIInTransaction(tx, kpiHeader.id, data.createdby || 1);
//           console.log(`KPI ${kpiHeader.id} auto-approved successfully`);
//         } else {
//           console.log(`KPI ${kpiHeader.id} requires workflow approval`);
//         }

//         return kpiHeader.id;
//       },
//       {
//         timeout: 30000,
//       }
//     );

//     if (needsWorkflow) {
//       try {
//         const requestResult = await createRequest({
//           requester_id: Number(data.employee_id),
//           request_type: "kpi_approval",
//           reference_id: kpiHeaderId,
//           createdby: data.createdby || 1,
//           log_inst: data.log_inst || 1,
//         });
//         console.log(
//           `Request created for KPI ${kpiHeaderId}:`,
//           requestResult?.request_created
//         );
//       } catch (requestError) {
//         console.error("Error creating approval request:", requestError);
//         throw new CustomError(
//           `Failed to create approval request: ${requestError.message}`,
//           500
//         );
//       }
//     }

//     const result = await findEmployeeKPIById(kpiHeaderId);
//     return result;
//   } catch (error) {
//     throw new CustomError(`Error creating Employee KPI: ${error.message}`, 500);
//   }
// };

const createEmployeeKPI = async (data) => {
  try {
    const reviewer = await prisma.hrms_d_employee.findUnique({
      where: { id: Number(data.reviewer_id) },
      select: {
        department_id: true,
        designation_id: true,
      },
    });

    const { workflow: workflowSteps } = await getWorkflowForRequest(
      "kpi_approval",
      reviewer?.department_id,
      reviewer?.designation_id
    );

    const needsWorkflow = workflowSteps && workflowSteps.length > 0;

    const initialStatus = "P";

    console.log(
      `KPI Workflow Check: needsWorkflow=${needsWorkflow}, initialStatus=${initialStatus}, approverCount=${
        workflowSteps?.length || 0
      }`
    );

    const kpiHeaderId = await prisma.$transaction(
      async (tx) => {
        const employee = await tx.hrms_d_employee.findUnique({
          where: { id: Number(data.employee_id) },
          select: { employment_type: true },
        });

        const lastKPI = await tx.hrms_d_employee_kpi.findFirst({
          where: {
            employee_id: Number(data.employee_id),
            status: "A",
          },
          orderBy: { createdate: "desc" },
          include: {
            kpi_contents: true,
          },
        });

        const contents = data.contents || [];
        let totalWeightedAchieved = 0;
        let totalWeightage = 0;

        const validContents = contents.filter((content) => {
          if (!content || !content.kpi_name || content.kpi_name.trim() === "") {
            return false;
          }
          const drawingType =
            content.kpi_drawing_type || "Active for Current & Next KPI";
          return (
            drawingType === "Active for Current & Next KPI" ||
            drawingType === "Active for Next KPI"
          );
        });

        validContents.forEach((item) => {
          const targetPoint = Number(item.target_point) || 0;
          const achievedPoint = Number(item.achieved_point) || 0;
          const weightage = Number(item.weightage_percentage) || 0;

          totalWeightage += weightage;

          if (targetPoint > 0) {
            const achievedPercent = (achievedPoint / targetPoint) * 100;
            totalWeightedAchieved += (achievedPercent * weightage) / 100;
          }
        });

        const rating =
          totalWeightage > 0 ? (totalWeightedAchieved / totalWeightage) * 5 : 0;

        const serializedData = serializeEmployeeKPIData(
          data,
          employee?.employment_type
        );
        const { status: _, ...dataWithoutStatus } = serializedData;

        const kpiHeader = await tx.hrms_d_employee_kpi.create({
          data: {
            ...dataWithoutStatus,
            rating: rating,
            last_kpi_id: lastKPI?.id || null,
            status: initialStatus, // Always "P"
            createdby: data.createdby || 1,
            createdate: new Date(),
            log_inst: data.log_inst || 1,
          },
        });

        if (contents.length > 0) {
          const filteredContents = lastKPI
            ? contents.filter((content) => {
                const lastKpiContent = lastKPI.kpi_contents.find(
                  (k) => k.kpi_name === content.kpi_name
                );
                return (
                  !lastKpiContent ||
                  lastKpiContent.kpi_drawing_type !== "Inactive for Next"
                );
              })
            : contents;

          for (const content of filteredContents) {
            const targetPoint = Number(content.target_point) || 0;
            const achievedPoint = Number(content.achieved_point) || 0;
            const achievedPercent =
              targetPoint > 0 ? (achievedPoint / targetPoint) * 100 : 0;

            await tx.hrms_d_employee_kpi_contents.create({
              data: {
                employee_kpi_id: kpiHeader.id,
                kpi_name: content.kpi_name || "",
                kpi_remarks: content.kpi_remarks || "",
                weightage_percentage: Number(content.weightage_percentage) || 0,
                target_point: targetPoint,
                achieved_point: achievedPoint,
                achieved_percentage: achievedPercent,
                kpi_drawing_type:
                  content.kpi_drawing_type || "Active for Current & Next KPI",
                target_point_for_next_kpi:
                  Number(content.target_point_for_next_kpi) || 0,
                weightage_percentage_for_next_kpi:
                  Number(content.weightage_percentage_for_next_kpi) || 0,
                createdby: data.createdby || 1,
                createdate: new Date(),
              },
            });
          }
        }

        if (
          data.revise_component_assignment === "Y" &&
          data.component_assignment
        ) {
          const lastComponentAssignment =
            await tx.hrms_d_employee_pay_component_assignment_header.findFirst({
              where: {
                employee_id: Number(data.employee_id),
                status: "Active",
              },
              orderBy: { createdate: "desc" },
              include: {
                hrms_d_employee_pay_component_assignment_line: true,
              },
            });

          const componentAssignment =
            await tx.hrms_d_employee_kpi_component_assignment.create({
              data: {
                employee_kpi_id: kpiHeader.id,
                header_payroll_rule: (() => {
                  const rule = data.component_assignment.header_payroll_rule;
                  if (
                    rule &&
                    rule !== "Biometric/Manual Attendance" &&
                    rule !== "Standard"
                  ) {
                    throw new CustomError(
                      'Payroll Rule must be either "Biometric/Manual Attendance" or "Standard"',
                      400
                    );
                  }
                  return rule || "Standard";
                })(),
                effective_from: data.component_assignment.effective_from
                  ? new Date(data.component_assignment.effective_from)
                  : new Date(),
                effective_to: data.component_assignment.effective_to
                  ? new Date(data.component_assignment.effective_to)
                  : null,
                status: "P",
                last_component_assignment_id:
                  lastComponentAssignment?.id || null,
                change_percentage:
                  Number(data.component_assignment.change_percentage) || 0,
                department_id: data.component_assignment.department_id
                  ? Number(data.component_assignment.department_id)
                  : null,
                designation_id: data.component_assignment.designation_id
                  ? Number(data.component_assignment.designation_id)
                  : null,
                position: data.component_assignment.position || "",
                successor_id: data.component_assignment.successor_id
                  ? Number(data.component_assignment.successor_id)
                  : null,
                createdby: data.createdby || 1,
                createdate: new Date(),
              },
            });

          const componentLines =
            data.component_assignment.component_lines || [];
          const linesToProcess =
            componentLines.length > 0
              ? componentLines
              : (
                  lastComponentAssignment?.hrms_d_employee_pay_component_assignment_line ||
                  []
                ).map((l) => ({
                  pay_component_id: l.pay_component_id,
                  amount: l.amount,
                }));

          for (const line of linesToProcess) {
            let amount = Number(line.amount) || 0;

            if (!line.amount && lastComponentAssignment) {
              const lastLine =
                lastComponentAssignment.hrms_d_employee_pay_component_assignment_line.find(
                  (l) => l.pay_component_id === Number(line.pay_component_id)
                );
              if (lastLine) {
                amount = Number(lastLine.amount);
              }
            }

            if (data.component_assignment.change_percentage) {
              const changePercent =
                Number(data.component_assignment.change_percentage) / 100;
              amount = amount * (1 + changePercent);
            }

            await tx.hrms_d_employee_kpi_component_lines.create({
              data: {
                component_assignment_id: componentAssignment.id,
                pay_component_id: Number(line.pay_component_id),
                amount: amount,
                createdby: data.createdby || 1,
                createdate: new Date(),
              },
            });
          }
        }

        if (data.attachments && data.attachments.length > 0) {
          for (const attachment of data.attachments) {
            await tx.hrms_d_employee_kpi_attachments.create({
              data: {
                employee_kpi_id: kpiHeader.id,
                document_type_id: attachment.document_type_id
                  ? Number(attachment.document_type_id)
                  : null,
                document_name: attachment.document_name || "",
                issue_date: attachment.issue_date
                  ? new Date(attachment.issue_date)
                  : new Date(),
                expiry_date: attachment.expiry_date
                  ? new Date(attachment.expiry_date)
                  : null,
                status: "P",
                remarks: attachment.remarks || "",
                attachment_url: attachment.attachment_url || "",
                createdby: data.createdby || 1,
                createdate: new Date(),
              },
            });
          }
        }

        if (!needsWorkflow) {
          console.log(
            `KPI ${kpiHeader.id} created as Pending (no workflow configured - requires manual approval)`
          );
        } else {
          console.log(
            `KPI ${kpiHeader.id} created as Pending (workflow approval required)`
          );
        }

        return kpiHeader.id;
      },
      {
        timeout: 30000,
      }
    );

    if (needsWorkflow) {
      try {
        const requestResult = await createRequest({
          requester_id: Number(data.reviewer_id),
          request_type: "kpi_approval",
          reference_id: kpiHeaderId,
          createdby: data.createdby || 1,
          log_inst: data.log_inst || 1,
        });
        console.log(
          `Approval request created for KPI ${kpiHeaderId}:`,
          requestResult?.request_created
        );
      } catch (requestError) {
        console.error("Error creating approval request:", requestError);
        throw new CustomError(
          `Failed to create approval request: ${requestError.message}`,
          500
        );
      }
    }

    const result = await findEmployeeKPIById(kpiHeaderId);
    return result;
  } catch (error) {
    throw new CustomError(`Error creating Employee KPI: ${error.message}`, 500);
  }
};

// const approveEmployeeKPI = async (kpiId, approverId) => {
//   try {
//     return await prisma.$transaction(async (tx) => {
//       const kpi = await tx.hrms_d_employee_kpi.findUnique({
//         where: { id: Number(kpiId) },
//         include: {
//           kpi_contents: true,
//           kpi_component_assignment: {
//             include: { kpi_component_lines: true },
//           },
//           kpi_attachments: true,
//         },
//       });

//       if (!kpi) {
//         throw new CustomError("KPI not found", 404);
//       }

//       await tx.hrms_d_employee_kpi.update({
//         where: { id: Number(kpiId) },
//         data: { status: "Active", updatedate: new Date() },
//       });

//       await tx.hrms_d_employee_kpi.updateMany({
//         where: {
//           employee_id: kpi.employee_id,
//           id: { not: Number(kpiId) },
//           status: "A",
//         },
//         data: { status: "Inactive", updatedate: new Date() },
//       });

//       const updateEmployeeData = {};
//       if (kpi.employment_type)
//         updateEmployeeData.employment_type = kpi.employment_type;
//       if (kpi.kpi_component_assignment?.department_id) {
//         updateEmployeeData.department_id =
//           kpi.kpi_component_assignment.department_id;
//       }
//       if (kpi.kpi_component_assignment?.designation_id) {
//         updateEmployeeData.designation_id =
//           kpi.kpi_component_assignment.designation_id;
//       }
//       if (kpi.kpi_component_assignment?.position) {
//         updateEmployeeData.work_location =
//           kpi.kpi_component_assignment.position;
//       }

//       if (Object.keys(updateEmployeeData).length > 0) {
//         await tx.hrms_d_employee.update({
//           where: { id: kpi.employee_id },
//           data: updateEmployeeData,
//         });
//       }

//       if (
//         kpi.revise_component_assignment === "Y" &&
//         kpi.kpi_component_assignment
//       ) {
//         const newComponentAssignment =
//           await tx.hrms_d_employee_pay_component_assignment_header.create({
//             data: {
//               employee_id: kpi.employee_id,
//               effective_from:
//                 kpi.kpi_component_assignment.effective_from || new Date(),
//               effective_to: kpi.kpi_component_assignment.effective_to,
//               department_id: kpi.kpi_component_assignment.department_id,
//               position_id: null,
//               status: "Active",
//               remarks: `Created from Employee KPI #${kpi.id}`,
//               createdby: approverId,
//               createdate: new Date(),
//             },
//           });

//         let lineNum = 1;
//         for (const line of kpi.kpi_component_assignment.kpi_component_lines) {
//           await tx.hrms_d_employee_pay_component_assignment_line.create({
//             data: {
//               parent_id: newComponentAssignment.id,
//               line_num: lineNum++,
//               pay_component_id: line.pay_component_id,
//               amount: line.amount,
//               type_value: line.amount,
//               is_taxable: "Y",
//               is_recurring: "Y",
//               component_type: "O",
//               createdby: approverId,
//               createdate: new Date(),
//             },
//           });
//         }
//       }

//       await tx.hrms_d_employee_kpi_attachments.updateMany({
//         where: { employee_kpi_id: Number(kpiId) },
//         data: { status: "Verified" },
//       });

//       for (const attachment of kpi.kpi_attachments) {
//         await tx.hrms_d_document_upload.create({
//           data: {
//             employee_id: kpi.employee_id,
//             document_type: attachment.kpi_attachment_doc_type?.name || "",
//             document_path: attachment.attachment_url || "",
//             document_number: attachment.document_name || "",
//             issued_date: attachment.issue_date,
//             expiry_date: attachment.expiry_date,
//             is_mandatory: "Y",
//             document_owner_type: "employee",
//             document_owner_id: kpi.employee_id,
//             createdby: approverId,
//             createdate: new Date(),
//           },
//         });
//       }

//       return await findEmployeeKPIById(kpiId);
//     });
//   } catch (error) {
//     throw new CustomError(
//       `Error approving Employee KPI: ${error.message}`,
//       500
//     );
//   }
// };

const approveEmployeeKPI = async (kpiId, approverId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const kpi = await tx.hrms_d_employee_kpi.findUnique({
        where: { id: Number(kpiId) },
        include: {
          kpi_contents: true,
          kpi_component_assignment: {
            include: { kpi_component_lines: true },
          },
          kpi_attachments: true,
        },
      });

      if (!kpi) {
        throw new CustomError("KPI not found", 404);
      }

      await tx.hrms_d_employee_kpi.update({
        where: { id: Number(kpiId) },
        data: { status: "Active", updatedate: new Date() },
      });

      await tx.hrms_d_employee_kpi.updateMany({
        where: {
          employee_id: kpi.employee_id,
          id: { not: Number(kpiId) },
          status: "A",
        },
        data: { status: "Inactive", updatedate: new Date() },
      });

      const updateEmployeeData = {};
      if (kpi.employment_type)
        updateEmployeeData.employment_type = kpi.employment_type;
      if (kpi.kpi_component_assignment?.department_id) {
        updateEmployeeData.department_id =
          kpi.kpi_component_assignment.department_id;
      }
      if (kpi.kpi_component_assignment?.designation_id) {
        updateEmployeeData.designation_id =
          kpi.kpi_component_assignment.designation_id;
      }
      if (kpi.kpi_component_assignment?.position) {
        updateEmployeeData.work_location =
          kpi.kpi_component_assignment.position;
      }

      if (Object.keys(updateEmployeeData).length > 0) {
        await tx.hrms_d_employee.update({
          where: { id: kpi.employee_id },
          data: updateEmployeeData,
        });
      }

      if (
        kpi.revise_component_assignment === "Y" &&
        kpi.kpi_component_assignment
      ) {
        const newComponentAssignment =
          await tx.hrms_d_employee_pay_component_assignment_header.create({
            data: {
              employee_id: kpi.employee_id,
              effective_from:
                kpi.kpi_component_assignment.effective_from || new Date(),
              effective_to: kpi.kpi_component_assignment.effective_to,
              department_id: kpi.kpi_component_assignment.department_id,
              position_id: null,
              status: "Active",
              remarks: `Created from Employee KPI #${kpi.id}`,
              createdby: approverId,
              createdate: new Date(),
            },
          });

        let lineNum = 1;
        for (const line of kpi.kpi_component_assignment.kpi_component_lines) {
          await tx.hrms_d_employee_pay_component_assignment_line.create({
            data: {
              parent_id: newComponentAssignment.id,
              line_num: lineNum++,
              pay_component_id: line.pay_component_id,
              amount: line.amount,
              type_value: line.amount,
              is_taxable: "Y",
              is_recurring: "Y",
              component_type: "O",
              createdby: approverId,
              createdate: new Date(),
            },
          });
        }
      }

      await tx.hrms_d_employee_kpi_attachments.updateMany({
        where: { employee_kpi_id: Number(kpiId) },
        data: { status: "Verified" },
      });

      for (const attachment of kpi.kpi_attachments) {
        await tx.hrms_d_document_upload.create({
          data: {
            employee_id: kpi.employee_id,
            document_type: attachment.kpi_attachment_doc_type?.name || "",
            document_path: attachment.attachment_url || "",
            document_number: attachment.document_name || "",
            issued_date: attachment.issue_date,
            expiry_date: attachment.expiry_date,
            is_mandatory: "Y",
            document_owner_type: "employee",
            document_owner_id: kpi.employee_id,
            createdby: approverId,
            createdate: new Date(),
          },
        });
      }

      return await findEmployeeKPIById(kpiId);
    });
  } catch (error) {
    throw new CustomError(
      `Error approving Employee KPI: ${error.message}`,
      500
    );
  }
};

// NEW FUNCTION: Manual rejection for KPIs without workflow
const rejectEmployeeKPI = async (kpiId, rejectedBy, remarks = "") => {
  try {
    return await prisma.$transaction(async (tx) => {
      const kpi = await tx.hrms_d_employee_kpi.findUnique({
        where: { id: Number(kpiId) },
      });

      if (!kpi) {
        throw new CustomError("KPI not found", 404);
      }

      if (kpi.status !== "P") {
        throw new CustomError("Only pending KPIs can be rejected", 400);
      }

      await tx.hrms_d_employee_kpi.update({
        where: { id: Number(kpiId) },
        data: {
          status: "R",
          review_remarks: remarks || kpi.review_remarks,
          updatedby: rejectedBy,
          updatedate: new Date(),
        },
      });

      return await findEmployeeKPIById(kpiId);
    });
  } catch (error) {
    throw new CustomError(
      `Error rejecting Employee KPI: ${error.message}`,
      500
    );
  }
};
const findEmployeeKPIById = async (id) => {
  try {
    const kpi = await prisma.hrms_d_employee_kpi.findUnique({
      where: { id: parseInt(id) },
      include: {
        kpi_employee: {
          select: { id: true, full_name: true, employee_code: true },
        },
        kpi_reviewer: {
          select: { id: true, full_name: true, employee_code: true },
        },
        kpi_contents: true,
        kpi_component_assignment: {
          include: {
            kpi_component_lines: {
              include: {
                kpi_component_pay_component: {
                  include: {
                    pay_component_cost_center1: {
                      select: { id: true, name: true },
                    },
                    pay_component_cost_center2: {
                      select: { id: true, name: true },
                    },
                    pay_component_cost_center3: {
                      select: { id: true, name: true },
                    },
                    pay_component_cost_center4: {
                      select: { id: true, name: true },
                    },
                    pay_component_cost_center5: {
                      select: { id: true, name: true },
                    },
                    pay_component_project: {
                      select: { id: true, name: true },
                    },
                    pay_component_tax: {
                      select: { id: true, name: true, code: true },
                    },
                  },
                },
              },
            },
            kpi_component_department: true,
            kpi_component_designation: true,
            kpi_component_successor: {
              select: { id: true, full_name: true, employee_code: true },
            },
          },
        },
        kpi_attachments: {
          include: {
            kpi_attachment_doc_type: true,
          },
        },
      },
    });
    if (!kpi) {
      throw new CustomError("Employee KPI not found", 404);
    }
    return kpi;
  } catch (error) {
    throw new CustomError(`Error finding Employee KPI: ${error.message}`, 503);
  }
};
const getLastKPIForEmployee = async (employeeId) => {
  try {
    const lastKPI = await prisma.hrms_d_employee_kpi.findFirst({
      where: {
        employee_id: Number(employeeId),
        status: "A",
      },
      orderBy: { createdate: "desc" },
      include: {
        kpi_contents: true,
      },
    });
    return lastKPI;
  } catch (error) {
    throw new CustomError(`Error retrieving last KPI: ${error.message}`, 503);
  }
};

const getLastComponentAssignmentForEmployee = async (employeeId) => {
  try {
    const lastAssignment =
      await prisma.hrms_d_employee_pay_component_assignment_header.findFirst({
        where: {
          employee_id: Number(employeeId),
          status: "Active",
        },
        orderBy: { createdate: "desc" },
        include: {
          hrms_d_employee_pay_component_assignment_line: {
            include: {
              pay_component_for_line: {
                select: {
                  id: true,
                  component_name: true,
                  component_code: true,
                  pay_or_deduct: true,
                  component_type: true,
                },
              },
              pay_component_line_currency: {
                select: {
                  id: true,
                  currency_name: true,
                  currency_code: true,
                },
              },
              pay_component_line_cost_center1: {
                select: {
                  id: true,
                  name: true,
                },
              },
              pay_component_line_cost_center2: {
                select: {
                  id: true,
                  name: true,
                },
              },
              pay_component_line_cost_center3: {
                select: {
                  id: true,
                  name: true,
                },
              },
              pay_component_line_cost_center4: {
                select: {
                  id: true,
                  name: true,
                },
              },
              pay_component_line_cost_center5: {
                select: {
                  id: true,
                  name: true,
                },
              },
              pay_component_line_project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    return lastAssignment;
  } catch (error) {
    throw new CustomError(
      `Error retrieving last component assignment: ${error.message}`,
      503
    );
  }
};

const findPendingKPIForEmployee = async (employeeId) => {
  try {
    const pendingKPI = await prisma.hrms_d_employee_kpi.findFirst({
      where: {
        employee_id: Number(employeeId),
        status: "Pending",
      },
      orderBy: { createdate: "desc" },
      include: {
        kpi_contents: true,
      },
    });
    return pendingKPI;
  } catch (error) {
    throw new CustomError(
      `Error finding pending KPI for employee: ${error.message}`,
      503
    );
  }
};

const getAllEmployeeKPI = async (
  page,
  size,
  search,
  startDate,
  endDate,
  employee_id,
  status
) => {
  try {
    page = page && page != 0 ? Number(page) : 1;
    size = size ? Number(size) : 10;
    const skip = (page - 1) * size;

    const filters = {};
    if (search && search.trim() !== "") {
      filters.OR = [
        {
          kpi_employee: {
            full_name: { contains: search, mode: "insensitive" },
          },
        },
        {
          kpi_employee: {
            employee_code: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }
    if (employee_id) {
      filters.employee_id = Number(employee_id);
    }
    if (status) {
      filters.status = status;
    }
    if (startDate && endDate && startDate !== "" && endDate !== "") {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          filters.review_date = { gte: start, lte: end };
        }
      } catch (dateError) {
        console.error("Error parsing dates:", dateError);
      }
    }

    const data = await prisma.hrms_d_employee_kpi.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ createdate: "desc" }],
      include: {
        kpi_employee: {
          select: { id: true, full_name: true, employee_code: true },
        },
        kpi_reviewer: {
          select: { id: true, full_name: true, employee_code: true },
        },
      },
    });

    const totalCount = await prisma.hrms_d_employee_kpi.count({
      where: filters,
    });

    return {
      data: data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.error("Error retrieving Employee KPIs:", error);
    throw new CustomError(
      `Error retrieving Employee KPIs: ${error.message}`,
      503
    );
  }
};

// const updateEmployeeKPI = async (id, data) => {
//   try {
//     const kpiId = await prisma.$transaction(
//       async (tx) => {
//         const existingKPI = await tx.hrms_d_employee_kpi.findUnique({
//           where: { id: Number(id) },
//         });

//         if (!existingKPI) {
//           throw new CustomError("Employee KPI not found", 404);
//         }

//         const employee = await tx.hrms_d_employee.findUnique({
//           where: { id: Number(data.employee_id) },
//           select: { employment_type: true },
//         });

//         const contents = data.contents || [];
//         let totalWeightedAchieved = 0;

//         contents.forEach((item) => {
//           const targetPoint = Number(item.target_point) || 0;
//           const achievedPoint = Number(item.achieved_point) || 0;
//           const weightage = Number(item.weightage_percentage) || 0;

//           if (targetPoint > 0) {
//             const achievedPercent = (achievedPoint / targetPoint) * 100;
//             totalWeightedAchieved += (achievedPercent * weightage) / 100;
//           }
//         });

//         const rating = totalWeightedAchieved / 20;

//         const updatedKPI = await tx.hrms_d_employee_kpi.update({
//           where: { id: Number(id) },
//           data: {
//             ...serializeEmployeeKPIData(data, employee?.employment_type),
//             rating: rating,
//             updatedby: data.updatedby || data.createdby || 1,
//             updatedate: new Date(),
//           },
//         });

//         await tx.hrms_d_employee_kpi_contents.deleteMany({
//           where: { employee_kpi_id: Number(id) },
//         });

//         if (contents.length > 0) {
//           for (const content of contents) {
//             const targetPoint = Number(content.target_point) || 0;
//             const achievedPoint = Number(content.achieved_point) || 0;
//             const achievedPercent =
//               targetPoint > 0 ? (achievedPoint / targetPoint) * 100 : 0;

//             await tx.hrms_d_employee_kpi_contents.create({
//               data: {
//                 employee_kpi_id: updatedKPI.id,
//                 kpi_name: content.kpi_name || "",
//                 kpi_remarks: content.kpi_remarks || "",
//                 weightage_percentage: Number(content.weightage_percentage) || 0,
//                 target_point: targetPoint,
//                 achieved_point: achievedPoint,
//                 achieved_percentage: achievedPercent,
//                 kpi_drawing_type:
//                   content.kpi_drawing_type || "Active for Current & Next KPI",
//                 target_point_for_next_kpi:
//                   Number(content.target_point_for_next_kpi) || 0,
//                 weightage_percentage_for_next_kpi:
//                   Number(content.weightage_percentage_for_next_kpi) || 0,
//                 createdby: data.createdby || 1,
//                 createdate: new Date(),
//               },
//             });
//           }
//         }

//         if (
//           data.revise_component_assignment === "Y" &&
//           data.component_assignment
//         ) {
//           const existingAssignments =
//             await tx.hrms_d_employee_kpi_component_assignment.findMany({
//               where: { employee_kpi_id: Number(id) },
//               select: { id: true },
//             });

//           const assignmentIds = existingAssignments.map((a) => a.id);

//           if (assignmentIds.length > 0) {
//             await tx.hrms_d_employee_kpi_component_lines.deleteMany({
//               where: {
//                 component_assignment_id: {
//                   in: assignmentIds,
//                 },
//               },
//             });

//             await tx.hrms_d_employee_kpi_component_assignment.deleteMany({
//               where: { employee_kpi_id: Number(id) },
//             });
//           }

//           const lastComponentAssignment =
//             await tx.hrms_d_employee_pay_component_assignment_header.findFirst({
//               where: {
//                 employee_id: Number(data.employee_id),
//                 status: "A",
//               },
//               orderBy: { createdate: "desc" },
//               include: {
//                 hrms_d_employee_pay_component_assignment_line: true,
//               },
//             });

//           const componentAssignment =
//             await tx.hrms_d_employee_kpi_component_assignment.create({
//               data: {
//                 employee_kpi_id: updatedKPI.id,
//                 header_payroll_rule: (() => {
//                   const rule = data.component_assignment.header_payroll_rule;
//                   if (
//                     rule &&
//                     rule !== "Biometric/Manual Attendance" &&
//                     rule !== "Standard"
//                   ) {
//                     throw new CustomError(
//                       'Header Payroll Rule must be either "Biometric/Manual Attendance" or "Standard"',
//                       400
//                     );
//                   }
//                   return rule || "Standard";
//                 })(),
//                 effective_from: data.component_assignment.effective_from
//                   ? new Date(data.component_assignment.effective_from)
//                   : new Date(),
//                 effective_to: data.component_assignment.effective_to
//                   ? new Date(data.component_assignment.effective_to)
//                   : null,
//                 status: "P",
//                 last_component_assignment_id:
//                   lastComponentAssignment?.id || null,
//                 change_percentage:
//                   Number(data.component_assignment.change_percentage) || 0,
//                 department_id: data.component_assignment.department_id
//                   ? Number(data.component_assignment.department_id)
//                   : null,
//                 designation_id: data.component_assignment.designation_id
//                   ? Number(data.component_assignment.designation_id)
//                   : null,
//                 position: data.component_assignment.position || "",
//                 successor_id: data.component_assignment.successor_id
//                   ? Number(data.component_assignment.successor_id)
//                   : null,
//                 createdby: data.createdby || 1,
//                 createdate: new Date(),
//               },
//             });

//           const componentLines =
//             data.component_assignment.component_lines || [];
//           const linesToProcess =
//             componentLines.length > 0
//               ? componentLines
//               : (
//                   lastComponentAssignment?.hrms_d_employee_pay_component_assignment_line ||
//                   []
//                 ).map((l) => ({
//                   pay_component_id: l.pay_component_id,
//                   amount: l.amount,
//                 }));

//           for (const line of linesToProcess) {
//             let amount = Number(line.amount) || 0;

//             if (!line.amount && lastComponentAssignment) {
//               const lastLine =
//                 lastComponentAssignment.hrms_d_employee_pay_component_assignment_line.find(
//                   (l) => l.pay_component_id === Number(line.pay_component_id)
//                 );
//               if (lastLine) {
//                 amount = Number(lastLine.amount);
//               }
//             }

//             if (data.component_assignment.change_percentage) {
//               const changePercent =
//                 Number(data.component_assignment.change_percentage) / 100;
//               amount = amount * (1 + changePercent);
//             }

//             await tx.hrms_d_employee_kpi_component_lines.create({
//               data: {
//                 component_assignment_id: componentAssignment.id,
//                 pay_component_id: Number(line.pay_component_id),
//                 amount: amount,
//                 createdby: data.createdby || 1,
//                 createdate: new Date(),
//               },
//             });
//           }
//         }

//         await tx.hrms_d_employee_kpi_attachments.deleteMany({
//           where: { employee_kpi_id: Number(id) },
//         });

//         if (data.attachments && data.attachments.length > 0) {
//           for (const attachment of data.attachments) {
//             await tx.hrms_d_employee_kpi_attachments.create({
//               data: {
//                 employee_kpi_id: updatedKPI.id,
//                 document_type_id: attachment.document_type_id
//                   ? Number(attachment.document_type_id)
//                   : null,
//                 document_name: attachment.document_name || "",
//                 issue_date: attachment.issue_date
//                   ? new Date(attachment.issue_date)
//                   : new Date(),
//                 expiry_date: attachment.expiry_date
//                   ? new Date(attachment.expiry_date)
//                   : null,
//                 status: "P",
//                 remarks: attachment.remarks || "",
//                 attachment_url: attachment.attachment_url || "",
//                 createdby: data.createdby || 1,
//                 createdate: new Date(),
//               },
//             });
//           }
//         }

//         return updatedKPI.id;
//       },
//       {
//         timeout: 30000,
//       }
//     );

//     return await findEmployeeKPIById(kpiId);
//   } catch (error) {
//     throw new CustomError(`Error updating Employee KPI: ${error.message}`, 500);
//   }
// };

const updateEmployeeKPI = async (id, data) => {
  try {
    const reviewer = await prisma.hrms_d_employee.findUnique({
      where: { id: Number(data.reviewer_id) },
      select: {
        department_id: true,
        designation_id: true,
      },
    });

    const { workflow: workflowSteps } = await getWorkflowForRequest(
      "kpi_approval",
      reviewer?.department_id,
      reviewer?.designation_id
    );

    const needsWorkflow = workflowSteps && workflowSteps.length > 0;
    const updateStatus = needsWorkflow ? "P" : "A";

    console.log(
      `KPI Update Workflow Check: needsWorkflow=${needsWorkflow}, updateStatus=${updateStatus}`
    );

    const kpiId = await prisma.$transaction(
      async (tx) => {
        const existingKPI = await tx.hrms_d_employee_kpi.findUnique({
          where: { id: Number(id) },
          select: {
            id: true,
            status: true,
            employee_id: true,
            reviewer_id: true,
          },
        });

        if (!existingKPI) {
          throw new CustomError("Employee KPI not found", 404);
        }

        const employee = await tx.hrms_d_employee.findUnique({
          where: { id: Number(data.employee_id) },
          select: { employment_type: true },
        });

        const contents = data.contents || [];
        let totalWeightedAchieved = 0;
        let totalWeightage = 0;

        const validContents = contents.filter((content) => {
          if (!content || !content.kpi_name || content.kpi_name.trim() === "") {
            return false;
          }
          const drawingType =
            content.kpi_drawing_type || "Active for Current & Next KPI";
          return (
            drawingType === "Active for Current & Next KPI" ||
            drawingType === "Active for Next KPI"
          );
        });

        validContents.forEach((item) => {
          const targetPoint = Number(item.target_point) || 0;
          const achievedPoint = Number(item.achieved_point) || 0;
          const weightage = Number(item.weightage_percentage) || 0;

          totalWeightage += weightage;

          if (targetPoint > 0) {
            const achievedPercent = (achievedPoint / targetPoint) * 100;
            totalWeightedAchieved += (achievedPercent * weightage) / 100;
          }
        });

        // Calculate rating: (totalWeightedAchieved / totalWeightage) * 5
        // Rating is out of 5, so multiply by 5
        const rating =
          totalWeightage > 0 ? (totalWeightedAchieved / totalWeightage) * 5 : 0;

        const serializedData = serializeEmployeeKPIData(
          data,
          employee?.employment_type
        );
        const { status: _, ...dataWithoutStatus } = serializedData;
        const updatedKPI = await tx.hrms_d_employee_kpi.update({
          where: { id: Number(id) },
          data: {
            ...dataWithoutStatus,
            rating: rating,
            status: updateStatus,
            updatedby: data.updatedby || data.createdby || 1,
            updatedate: new Date(),
          },
        });

        await tx.hrms_d_employee_kpi_contents.deleteMany({
          where: { employee_kpi_id: Number(id) },
        });

        if (contents.length > 0) {
          for (const content of contents) {
            const targetPoint = Number(content.target_point) || 0;
            const achievedPoint = Number(content.achieved_point) || 0;
            const achievedPercent =
              targetPoint > 0 ? (achievedPoint / targetPoint) * 100 : 0;

            await tx.hrms_d_employee_kpi_contents.create({
              data: {
                employee_kpi_id: updatedKPI.id,
                kpi_name: content.kpi_name || "",
                kpi_remarks: content.kpi_remarks || "",
                weightage_percentage: Number(content.weightage_percentage) || 0,
                target_point: targetPoint,
                achieved_point: achievedPoint,
                achieved_percentage: achievedPercent,
                kpi_drawing_type:
                  content.kpi_drawing_type || "Active for Current & Next KPI",
                target_point_for_next_kpi:
                  Number(content.target_point_for_next_kpi) || 0,
                weightage_percentage_for_next_kpi:
                  Number(content.weightage_percentage_for_next_kpi) || 0,
                createdby: data.createdby || 1,
                createdate: new Date(),
              },
            });
          }
        }

        if (
          data.revise_component_assignment === "Y" &&
          data.component_assignment
        ) {
          const existingAssignments =
            await tx.hrms_d_employee_kpi_component_assignment.findMany({
              where: { employee_kpi_id: Number(id) },
              select: { id: true },
            });

          const assignmentIds = existingAssignments.map((a) => a.id);

          if (assignmentIds.length > 0) {
            await tx.hrms_d_employee_kpi_component_lines.deleteMany({
              where: {
                component_assignment_id: { in: assignmentIds },
              },
            });

            await tx.hrms_d_employee_kpi_component_assignment.deleteMany({
              where: { employee_kpi_id: Number(id) },
            });
          }

          const lastComponentAssignment =
            await tx.hrms_d_employee_pay_component_assignment_header.findFirst({
              where: {
                employee_id: Number(data.employee_id),
                status: "Active",
              },
              orderBy: { createdate: "desc" },
              include: {
                hrms_d_employee_pay_component_assignment_line: true,
              },
            });

          const componentAssignment =
            await tx.hrms_d_employee_kpi_component_assignment.create({
              data: {
                employee_kpi_id: updatedKPI.id,
                header_payroll_rule: (() => {
                  const rule = data.component_assignment.header_payroll_rule;
                  if (
                    rule &&
                    rule !== "Biometric/Manual Attendance" &&
                    rule !== "Standard"
                  ) {
                    throw new CustomError(
                      'Payroll Rule must be either "Biometric/Manual Attendance" or "Standard"',
                      400
                    );
                  }
                  return rule || "Standard";
                })(),
                effective_from: data.component_assignment.effective_from
                  ? new Date(data.component_assignment.effective_from)
                  : new Date(),
                effective_to: data.component_assignment.effective_to
                  ? new Date(data.component_assignment.effective_to)
                  : null,
                status: "P",
                last_component_assignment_id:
                  lastComponentAssignment?.id || null,
                change_percentage:
                  Number(data.component_assignment.change_percentage) || 0,
                department_id: data.component_assignment.department_id
                  ? Number(data.component_assignment.department_id)
                  : null,
                designation_id: data.component_assignment.designation_id
                  ? Number(data.component_assignment.designation_id)
                  : null,
                position: data.component_assignment.position || "",
                successor_id: data.component_assignment.successor_id
                  ? Number(data.component_assignment.successor_id)
                  : null,
                createdby: data.createdby || 1,
                createdate: new Date(),
              },
            });

          const componentLines =
            data.component_assignment.component_lines || [];
          const linesToProcess =
            componentLines.length > 0
              ? componentLines
              : (
                  lastComponentAssignment?.hrms_d_employee_pay_component_assignment_line ||
                  []
                ).map((l) => ({
                  pay_component_id: l.pay_component_id,
                  amount: l.amount,
                }));

          for (const line of linesToProcess) {
            let amount = Number(line.amount) || 0;

            if (!line.amount && lastComponentAssignment) {
              const lastLine =
                lastComponentAssignment.hrms_d_employee_pay_component_assignment_line.find(
                  (l) => l.pay_component_id === Number(line.pay_component_id)
                );
              if (lastLine) {
                amount = Number(lastLine.amount);
              }
            }

            if (data.component_assignment.change_percentage) {
              const changePercent =
                Number(data.component_assignment.change_percentage) / 100;
              amount = amount * (1 + changePercent);
            }

            await tx.hrms_d_employee_kpi_component_lines.create({
              data: {
                component_assignment_id: componentAssignment.id,
                pay_component_id: Number(line.pay_component_id),
                amount: amount,
                createdby: data.createdby || 1,
                createdate: new Date(),
              },
            });
          }
        }

        await tx.hrms_d_employee_kpi_attachments.deleteMany({
          where: { employee_kpi_id: Number(id) },
        });

        if (data.attachments && data.attachments.length > 0) {
          for (const attachment of data.attachments) {
            await tx.hrms_d_employee_kpi_attachments.create({
              data: {
                employee_kpi_id: updatedKPI.id,
                document_type_id: attachment.document_type_id
                  ? Number(attachment.document_type_id)
                  : null,
                document_name: attachment.document_name || "",
                issue_date: attachment.issue_date
                  ? new Date(attachment.issue_date)
                  : new Date(),
                expiry_date: attachment.expiry_date
                  ? new Date(attachment.expiry_date)
                  : null,
                status: "P",
                remarks: attachment.remarks || "",
                attachment_url: attachment.attachment_url || "",
                createdby: data.createdby || 1,
                createdate: new Date(),
              },
            });
          }
        }

        if (!needsWorkflow) {
          console.log(
            `KPI ${updatedKPI.id} updated with Active status (no workflow configured)`
          );
        } else {
          console.log(
            `KPI ${updatedKPI.id} updated with Pending status - requires approval`
          );
        }

        return updatedKPI.id;
      },
      {
        timeout: 30000,
      }
    );

    if (needsWorkflow) {
      try {
        const requestResult = await createRequest({
          requester_id: Number(data.employee_id),
          request_type: "kpi_approval",
          reference_id: kpiId,
          createdby: data.createdby || 1,
          log_inst: data.log_inst || 1,
        });
        console.log(
          `Request created for KPI ${kpiId}:`,
          requestResult?.request_created
        );
      } catch (requestError) {
        console.error("Error creating approval request:", requestError);
        throw new CustomError(
          `Failed to create approval request: ${requestError.message}`,
          500
        );
      }
    }

    const result = await findEmployeeKPIById(kpiId);
    return result;
  } catch (error) {
    console.error("Error in updateEmployeeKPI:", error);
    throw new CustomError(`Error updating Employee KPI: ${error.message}`, 500);
  }
};

const deleteEmployeeKPI = async (id) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const kpi = await tx.hrms_d_employee_kpi.findUnique({
        where: { id: Number(id) },
      });

      if (!kpi) {
        throw new CustomError("Employee KPI not found", 404);
      }

      await tx.hrms_d_employee_kpi_contents.deleteMany({
        where: { employee_kpi_id: Number(id) },
      });

      const componentAssignments =
        await tx.hrms_d_employee_kpi_component_assignment.findMany({
          where: { employee_kpi_id: Number(id) },
          select: { id: true },
        });

      for (const assignment of componentAssignments) {
        await tx.hrms_d_employee_kpi_component_lines.deleteMany({
          where: { component_assignment_id: assignment.id },
        });
      }

      await tx.hrms_d_employee_kpi_component_assignment.deleteMany({
        where: { employee_kpi_id: Number(id) },
      });

      await tx.hrms_d_employee_kpi_attachments.deleteMany({
        where: { employee_kpi_id: Number(id) },
      });

      await tx.hrms_d_employee_kpi.delete({
        where: { id: Number(id) },
      });

      return { id: Number(id), message: "Employee KPI deleted successfully" };
    });
  } catch (error) {
    throw new CustomError(`Error deleting Employee KPI: ${error.message}`, 500);
  }
};

module.exports = {
  createEmployeeKPI,
  findEmployeeKPIById,
  approveEmployeeKPI,
  getLastKPIForEmployee,
  getLastComponentAssignmentForEmployee,
  getAllEmployeeKPI,
  updateEmployeeKPI,
  deleteEmployeeKPI,
  findPendingKPIForEmployee,
};
