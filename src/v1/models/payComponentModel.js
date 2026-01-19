const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { toLowerCase } = require("zod/v4");
const { id } = require("date-fns/locale");
// const mockPayComponents = require("../../mock/payComponent.mock.js");

// const serializePayComponentData = (data) => ({
//   component_name: data.component_name || "",
//   component_code: data.component_code || "",
//   component_type: data.component_type || "",
//   is_taxable: data.is_taxable || "Y",
//   is_statutory: data.is_statutory || "N",
//   is_active: data.is_active || "Y",
//   is_loan: data.is_loan || "N",
//   is_basic: data.is_basic || "N",
//   relief_amount: data.relief_amount || "",
//   relief_type: data.relief_type || "",
//   pay_or_deduct: data.pay_or_deduct || "P",
//   is_worklife_related: data.is_worklife_related || "N",
//   is_grossable: data.is_grossable || "N",
//   is_advance: data.is_advance || "N",
//   contribution_of_employee: data.contribution_of_employee,
//   employer_default_formula: data.employer_default_formula,
//   // tax_code_id: data.tax_code_id ? Number(data.tax_code_id) : null,
//   tax_code_id: data.tax_code_id ? Number(data.tax_code_id) : undefined,
//   gl_account_id: data.gl_account_id ? Number(data.gl_account_id) : null,
//   factor: data.factor ? Number(data.factor) : null,
//   gl_account_id: data.gl_account_id ? Number(data.gl_account_id) : undefined,
//   factor: data.factor ? Number(data.factor) : undefined,
//   payable_glaccount_id: data.payable_glaccount_id
//     ? Number(data.payable_glaccount_id)
//     : null,
//   project_id: data.project_id ? Number(data.project_id) : null,
//   project_id: data.project_id ? Number(data.project_id) : undefined,

//   // cost_center1_id: data.cost_center1_id ? Number(data.cost_center1_id) : null,
//   // cost_center2_id: data.cost_center2_id ? Number(data.cost_center2_id) : null,
//   // cost_center3_id: data.cost_center3_id ? Number(data.cost_center3_id) : null,
//   // cost_center4_id: data.cost_center4_id ? Number(data.cost_center4_id) : null,
//   // cost_center5_id: data.cost_center5_id ? Number(data.cost_center5_id) : null,
//   cost_center1_id: data.cost_center1_id
//     ? Number(data.cost_center1_id)
//     : undefined,
//   cost_center2_id: data.cost_center2_id
//     ? Number(data.cost_center2_id)
//     : undefined,
//   cost_center3_id: data.cost_center3_id
//     ? Number(data.cost_center3_id)
//     : undefined,
//   cost_center4_id: data.cost_center4_id
//     ? Number(data.cost_center4_id)
//     : undefined,
//   cost_center5_id: data.cost_center5_id
//     ? Number(data.cost_center5_id)
//     : undefined,
//   column_order: data.column_order ? Number(data.column_order) : null,
//   column_order: data.column_order ? Number(data.column_order) : undefined,

//   execution_order: data.execution_order ? Number(data.execution_order) : null,
//   execution_order: data.execution_order
//     ? Number(data.execution_order)
//     : undefined,

//   visible_in_payslip: data.visible_in_payslip || "",
//   default_formula: data.default_formula || "",
//   formula_editable: data.formula_editable || "",
//   is_recurring: data.is_recurring || "",
//   component_subtype: data.component_subtype || "",
//   is_overtime_related: data.is_overtime_related || "N",
//   contributes_to_paye: data.contributes_to_paye || "N",
//   contributes_to_nssf: data.contributes_to_nssf || "N",
//   auto_fill: data.auto_fill || "N",
//   unpaid_leave: data.unpaid_leave || "N",
// });

// // Create a new pay component
// // const createPayComponent = async (data) => {
// //   try {
// //     const totalCount = await prisma.hrms_m_pay_component.count({
// //       where: {
// //         OR: [
// //           { component_name: toLowerCase(data.component_name) },
// //           { component_code: toLowerCase(data.component_code) },
// //         ],
// //       },
// //     });
// //     if (totalCount > 0) {
// //       throw new CustomError(
// //         "Pay component with the same name or code already exists",
// //         400
// //       );
// //     }
// //     const result = await prisma.$transaction(async (prisma) => {
// //       const reqData = await prisma.hrms_m_pay_component.create({
// //         data: {
// //           ...serializePayComponentData(data),
// //           createdby: data.createdby || 1,
// //           createdate: new Date(),
// //           log_inst: data.log_inst || 1,
// //         },
// //         include: {
// //           pay_component_tax: {
// //             select: {
// //               id: true,
// //               pay_component_id: true,
// //               rule_type: true,
// //             },
// //           },
// //           pay_component_project: {
// //             select: {
// //               id: true,
// //               code: true,
// //               name: true,
// //             },
// //           },
// //           // pay_component_for_line: {
// //           //   select: {
// //           //     id: true,
// //           //     component_name: true,
// //           //     component_code: true,
// //           //     component_type: true,
// //           //   },
// //           // },
// //           pay_component_cost_center1: {
// //             select: {
// //               id: true,
// //               name: true,
// //               dimension_id: true,
// //             },
// //           },
// //           pay_component_cost_center2: {
// //             select: {
// //               id: true,
// //               name: true,
// //               dimension_id: true,
// //             },
// //           },
// //           pay_component_cost_center3: {
// //             select: {
// //               id: true,
// //               name: true,
// //               dimension_id: true,
// //             },
// //           },
// //           pay_component_cost_center4: {
// //             select: {
// //               id: true,
// //               name: true,
// //               dimension_id: true,
// //             },
// //           },
// //           pay_component_cost_center5: {
// //             select: {
// //               id: true,
// //               name: true,
// //               dimension_id: true,
// //             },
// //           },
// //         },
// //       });
// //       // Step 2: Dynamically add column to monthly payroll table
// //       // const columnName = prisma.sql([`"${data.component_code}"`]); // Safe quoting
// //       // const alterQuery = prisma.raw(`
// //       //   ALTER TABLE monthly_payroll_processing
// //       //   ADD COLUMN ${data.component_code} VARCHAR(255) DEFAULT NULL;
// //       // `);

// //       if (!/^\d+$/.test(data.component_code)) {
// //         throw new Error("Invalid column name. Must be numeric.");
// //       }

// //       await prisma.$executeRawUnsafe(`
// //   ALTER TABLE hrms_d_monthly_payroll_processing
// //   ADD [${data.component_code}] DECIMAL(18,4) NULL
// // `);
// //       return reqData;
// //     });
// //     return result;
// //   } catch (error) {
// //     if (error.code === "23505" || error.message.includes("already exists")) {
// //       throw new CustomError(
// //         `Component code already used as column in payroll processing`,
// //         400
// //       );
// //     }
// //     throw new CustomError(
// //       `Error creating pay component: ${error.message}`,
// //       500
// //     );
// //   }
// // };

// const createPayComponent = async (data) => {
//   try {
//     data.component_name = data.component_name.trim();
//     data.component_code = data.component_code.trim();

//     if (!/^\d+$/.test(data.component_code)) {
//       throw new CustomError("Invalid component code. Must be numeric.", 400);
//     }

//     const existing = await prisma.hrms_m_pay_component.findFirst({
//       where: {
//         OR: [
//           { component_name: { equals: data.component_name } },
//           { component_code: { equals: data.component_code } },
//         ],
//       },
//     });

//     if (existing) {
//       if (
//         existing.component_code.toLowerCase() ===
//         data.component_code.toLowerCase()
//       ) {
//         throw new CustomError(
//           "Pay component with the same code already exists",
//           400
//         );
//       } else {
//         throw new CustomError(
//           "Pay component with the same name already exists",
//           400
//         );
//       }
//     }

//     const columnExists = await prisma.$queryRawUnsafe(`
//       SELECT 1
//       FROM INFORMATION_SCHEMA.COLUMNS
//       WHERE TABLE_NAME = 'hrms_d_monthly_payroll_processing'
//       AND COLUMN_NAME = '${data.component_code}'
//     `);

//     const result = await prisma.$transaction(
//       async (prisma) => {
//         const reqData = await prisma.hrms_m_pay_component.create({
//           data: {
//             ...serializePayComponentData(data),
//             createdby: data.createdby || 1,
//             createdate: new Date(),
//             log_inst: data.log_inst || 1,
//           },
//           include: {
//             pay_component_tax: true,
//             pay_component_project: true,
//             pay_component_cost_center1: true,
//             pay_component_cost_center2: true,
//             pay_component_cost_center3: true,
//             pay_component_cost_center4: true,
//             pay_component_cost_center5: true,
//             pay_component_for_line: true,
//             hrms_m_pay_component_formula: true,
//           },
//         });

//         if (!columnExists || columnExists.length === 0) {
//           await prisma.$executeRawUnsafe(`
//             ALTER TABLE hrms_d_monthly_payroll_processing
//             ADD [${data.component_code}] DECIMAL(18,4) NULL
//           `);
//           console.log(`Column [${data.component_code}] added to payroll table`);
//         } else {
//           console.log(
//             `Column [${data.component_code}] already exists in payroll table`
//           );
//         }

//         return reqData;
//       },
//       {
//         maxWait: 10000,
//         timeout: 30000,
//       }
//     );

//     const requester_id = data.createdby;
//     const requesterExists = await prisma.hrms_d_employee.findUnique({
//       where: { id: Number(requester_id) },
//       select: { id: true, full_name: true, employee_code: true },
//     });

//     if (!requesterExists) {
//       await prisma.hrms_m_pay_component.delete({
//         where: { id: result.id },
//       });
//       throw new CustomError(
//         `Cannot create pay component: User ID ${requester_id} is not a valid employee.`,
//         403
//       );
//     }

//     return result;
//   } catch (error) {
//     if (error.code === "23505" || error.message.includes("already exists")) {
//       throw new CustomError(`Component name or code already used`, 400);
//     }

//     throw new CustomError(
//       `Error creating pay component: ${error.message}`,
//       500
//     );
//   }
// };

const serializePayComponentData = (data) => {
  const SMALLINT_MIN = -32768;
  const SMALLINT_MAX = 32767;

  let factor = null;
  if (data.factor !== null && data.factor !== undefined && data.factor !== "") {
    const factorNum = Math.round(Number(data.factor));
    if (factorNum < SMALLINT_MIN || factorNum > SMALLINT_MAX) {
      throw new CustomError(
        `Factor value ${factorNum} is out of range. Must be between ${SMALLINT_MIN} and ${SMALLINT_MAX}.`,
        400
      );
    }
    factor = factorNum;
  }

  let columnOrder = null;
  if (
    data.column_order !== null &&
    data.column_order !== undefined &&
    data.column_order !== ""
  ) {
    const columnOrderNum = Number(data.column_order);
    if (columnOrderNum < SMALLINT_MIN || columnOrderNum > SMALLINT_MAX) {
      throw new CustomError(
        `Column order value ${columnOrderNum} is out of range. Must be between ${SMALLINT_MIN} and ${SMALLINT_MAX}.`,
        400
      );
    }
    columnOrder = columnOrderNum;
  }

  return {
    component_name: data.component_name || "",
    component_code: data.component_code || "",
    component_type: data.component_type || "",
    is_taxable: data.is_taxable ?? "Y",
    is_statutory: data.is_statutory ?? "N",
    is_active: data.is_active ?? "Y",
    is_loan: data.is_loan ?? "N",
    is_basic: data.is_basic ?? "N",
    relief_amount: data.relief_amount ?? null,
    relief_type: data.relief_type ?? null,
    pay_or_deduct: data.pay_or_deduct ?? "P",
    is_worklife_related: data.is_worklife_related ?? "N",
    is_grossable: data.is_grossable ?? "N",
    is_advance: data.is_advance ?? "N",
    contribution_of_employee: data.contribution_of_employee ?? null,
    employer_default_formula: data.employer_default_formula ?? null,
    tax_code_id: data.tax_code_id ? Number(data.tax_code_id) : null,
    gl_account_id: data.gl_account_id ? Number(data.gl_account_id) : null,
    factor: factor,
    payable_glaccount_id: data.payable_glaccount_id
      ? Number(data.payable_glaccount_id)
      : null,
    project_id: data.project_id ? Number(data.project_id) : null,
    cost_center1_id: data.cost_center1_id ? Number(data.cost_center1_id) : null,
    cost_center2_id: data.cost_center2_id ? Number(data.cost_center2_id) : null,
    cost_center3_id: data.cost_center3_id ? Number(data.cost_center3_id) : null,
    cost_center4_id: data.cost_center4_id ? Number(data.cost_center4_id) : null,
    cost_center5_id: data.cost_center5_id ? Number(data.cost_center5_id) : null,
    column_order: columnOrder,
    execution_order: data.execution_order ? Number(data.execution_order) : null,
    visible_in_payslip: data.visible_in_payslip ?? "Y",
    default_formula: data.default_formula ?? null,
    formula_editable: data.formula_editable ?? "Y",
    is_recurring: data.is_recurring ?? "Y",
    component_subtype: data.component_subtype ?? null,
    is_overtime_related: data.is_overtime_related ?? "N",
    contributes_to_paye: data.contributes_to_paye ?? "N",
    contributes_to_nssf: data.contributes_to_nssf ?? "N",
    auto_fill: data.auto_fill ?? "N",
    unpaid_leave: data.unpaid_leave ?? "N",
  };
};

const createPayComponent = async (data) => {
  try {
    if (!data.component_name || !data.component_code) {
      throw new CustomError(
        "component_name and component_code are required",
        400
      );
    }

    data.component_name = String(data.component_name).trim();
    data.component_code = String(data.component_code).trim();

    if (!/^\d+$/.test(data.component_code)) {
      throw new CustomError("Invalid component code. Must be numeric.", 400);
    }

    const requesterId = Number(data.createdby ?? 1);
    if (Number.isNaN(requesterId) || requesterId <= 0) {
      throw new CustomError("Invalid createdby value", 400);
    }

    const requesterExists = await prisma.hrms_d_employee.findUnique({
      where: { id: requesterId },
      select: { id: true },
    });

    if (!requesterExists) {
      throw new CustomError(
        `Cannot create pay component: User ID ${requesterId} is not a valid employee.`,
        403
      );
    }

    const existing = await prisma.hrms_m_pay_component.findFirst({
      where: {
        OR: [
          { component_name: { equals: data.component_name } },
          { component_code: { equals: data.component_code } },
        ],
      },
    });

    if (existing) {
      if (
        existing.component_code &&
        existing.component_code.toLowerCase() ===
          data.component_code.toLowerCase()
      ) {
        throw new CustomError(
          "Pay component with the same code already exists",
          400
        );
      } else {
        throw new CustomError(
          "Pay component with the same name already exists",
          400
        );
      }
    }

    const columnExists = await prisma.$queryRawUnsafe(`
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hrms_d_monthly_payroll_processing'
      AND COLUMN_NAME = '${data.component_code}'
    `);

    const result = await prisma.$transaction(
      async (tx) => {
        const created = await tx.hrms_m_pay_component.create({
          data: {
            ...serializePayComponentData(data),
            createdby: requesterId,
            createdate: new Date(),
            log_inst: data.log_inst ?? 1,
          },
          include: {
            pay_component_tax: true,
            pay_component_project: true,
            pay_component_cost_center1: true,
            pay_component_cost_center2: true,
            pay_component_cost_center3: true,
            pay_component_cost_center4: true,
            pay_component_cost_center5: true,
            pay_component_for_line: true,
            hrms_m_pay_component_formula: true,
          },
        });

        if (!columnExists || columnExists.length === 0) {
          try {
            await tx.$executeRawUnsafe(`
              ALTER TABLE hrms_d_monthly_payroll_processing
              ADD [${data.component_code}] DECIMAL(18,4) NULL
            `);
            console.log(
              `Column [${data.component_code}] added to payroll table`
            );
          } catch (sqlErr) {
            console.error("ALTER TABLE failed:", sqlErr.message);
            throw new Error(`Failed to add payroll column: ${sqlErr.message}`);
          }
        } else {
          console.log(`Column [${data.component_code}] already exists`);
        }

        return created;
      },
      { maxWait: 10000, timeout: 30000 }
    );

    return result;
  } catch (error) {
    // Prisma unique violation or custom messages
    if (
      error.code === "23505" ||
      (error.message && error.message.includes("already exists"))
    ) {
      throw new CustomError(`Component name or code already used`, 400);
    }

    if (error instanceof CustomError) throw error;

    throw new CustomError(
      `Error creating pay component: ${error.message}`,
      500
    );
  }
};

const findPayComponentById = async (id) => {
  try {
    const reqData = await prisma.hrms_m_pay_component.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Pay component not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding pay component by ID: ${error.message}`,
      503
    );
  }
};

const updatePayComponent = async (id, data) => {
  try {
    const totalCount = await prisma.hrms_m_pay_component.count({
      where: {
        OR: [
          { component_name: toLowerCase(data.component_name) },
          { component_code: toLowerCase(data.component_code) },
        ],
      },
    });
    if (totalCount > 0) {
      throw new CustomError(
        "Pay component with the same name or code already exists",
        400
      );
    }
    const updatedEntry = await prisma.hrms_m_pay_component.update({
      where: { id: parseInt(id) },
      data: {
        ...serializePayComponentData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },

      include: {
        pay_component_tax: true,
        pay_component_project: true,
        pay_component_cost_center1: true,
        pay_component_cost_center2: true,
        pay_component_cost_center3: true,
        pay_component_cost_center4: true,
        pay_component_cost_center5: true,
        pay_component_for_line: true,
        hrms_m_pay_component_formula: true,
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating pay component: ${error.message}`,
      500
    );
  }
};

// level 2
// const updatePayComponent = async (id, data) => {
//   try {
//     const totalCount = await prisma.hrms_m_pay_component.count({
//       where: {
//         OR: [
//           { component_name: toLowerCase(data.component_name) },
//           { component_code: toLowerCase(data.component_code) },
//         ],
//       },
//     });

//     if (totalCount > 0) {
//       throw new CustomError(
//         "Pay component with the same name or code already exists",
//         400
//       );
//     }

//     if (!/^\d+$/.test(data.component_code)) {
//       throw new CustomError("Invalid component code. Must be numeric.", 400);
//     }

//     try {
//       await prisma.$executeRawUnsafe(`
//         ALTER TABLE hrms_d_monthly_payroll_processing
//         ADD [${data.component_code}] DECIMAL(18,4) NULL
//       `);
//       console.log(`Successfully created column ${data.component_code}`);
//     } catch (sqlError) {
//       console.error("SQL Error:", sqlError.message);
//       if (
//         sqlError.message.includes("duplicate") ||
//         sqlError.message.includes("already exists")
//       ) {
//         console.log(`Column ${data.component_code} already exists`);
//       } else {
//         throw new CustomError(
//           `Failed to alter payroll processing table: ${sqlError.message}`,
//           500
//         );
//       }
//     }
//     const updatedEntry = await prisma.hrms_m_pay_component.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...serializePayComponentData(data),
//         updatedby: data.updatedby || 1,
//         updatedate: new Date(),
//       },
//       include: {
//         pay_component_tax: {
//           select: {
//             id: true,
//             pay_component_id: true,
//             rule_type: true,
//           },
//         },
//         pay_component_project: {
//           select: {
//             id: true,
//             code: true,
//             name: true,
//           },
//         },
//         pay_component_for_line: {
//           select: {
//             id: true,
//             component_type: true,
//           },
//         },
//         pay_component_cost_center1: {
//           select: {
//             id: true,
//             name: true,
//             dimension_id: true,
//           },
//         },
//         pay_component_cost_center2: {
//           select: {
//             id: true,
//             name: true,
//             dimension_id: true,
//           },
//         },
//         pay_component_cost_center3: {
//           select: {
//             id: true,
//             name: true,
//             dimension_id: true,
//           },
//         },
//         pay_component_cost_center4: {
//           select: {
//             id: true,
//             name: true,
//             dimension_id: true,
//           },
//         },
//         pay_component_cost_center5: {
//           select: {
//             id: true,
//             name: true,
//             dimension_id: true,
//           },
//         },
//       },
//     });

//     return updatedEntry;
//   } catch (error) {
//     throw new CustomError(
//       `Error updating pay component: ${error.message}`,
//       500
//     );
//   }
// };

// level 3 -  For updating all(Only for emegency puropose - Dont useit)
// const updatePayComponent = async () => {
//   try {
//     const allComponents = await prisma.hrms_m_pay_component.findMany({
//       where: {
//         is_active: "Y",
//       },
//       orderBy: {
//         id: "asc",
//       },
//     });

//     const updatedComponents = [];
//     const seenCodes = new Set();

//     for (const component of allComponents) {
//       const componentId = component.id;
//       const code = component.component_code;

//       if (!/^\d+$/.test(code)) {
//         console.warn(`Skipping invalid code ${code} for ID ${componentId}`);
//         continue;
//       }

//       if (seenCodes.has(code)) {
//         console.log(`Skipping duplicate code ${code}`);
//         continue;
//       }
//       seenCodes.add(code);

//       const columnExists = await prisma.$queryRawUnsafe(`
//         SELECT 1
//         FROM INFORMATION_SCHEMA.COLUMNS
//         WHERE TABLE_NAME = 'hrms_d_monthly_payroll_processing'
//         AND COLUMN_NAME = '${code}'
//       `);

//       if (!columnExists || columnExists.length === 0) {
//         try {
//           await prisma.$executeRawUnsafe(`
//             ALTER TABLE hrms_d_monthly_payroll_processing
//             ADD [${code}] DECIMAL(18,4) NULL
//           `);
//           console.log(`Created column ${code}`);
//         } catch (sqlError) {
//           throw new CustomError(
//             `Failed to alter table for component ${componentId}: ${sqlError.message}`,
//             500
//           );
//         }
//       } else {
//         console.log(` Column ${code} already exists`);
//       }

//       try {
//         const updated = await prisma.$transaction(async (tx) => {
//           const duplicateCount = await tx.hrms_m_pay_component.count({
//             where: {
//               id: { not: componentId },
//               OR: [
//                 { component_name: toLowerCase(component.component_name) },
//                 { component_code: toLowerCase(component.component_code) },
//               ],
//             },
//           });

//           if (duplicateCount > 0) {
//             throw new CustomError(
//               `Duplicate found for component ID ${componentId}`,
//               400
//             );
//           }

//           return await tx.hrms_m_pay_component.update({
//             where: { id: componentId },
//             data: {
//               ...serializePayComponentData(component),
//               updatedby: component.updatedby || 1,
//               updatedate: new Date(),
//             },
//             include: {
//               pay_component_tax: true,
//               pay_component_project: true,
//               pay_component_cost_center1: true,
//               pay_component_cost_center2: true,
//               pay_component_cost_center3: true,
//               pay_component_cost_center4: true,
//               pay_component_cost_center5: true,
//               pay_component_for_line: true,
//               hrms_m_pay_component_formula: true,
//             },
//           });
//         });

//         updatedComponents.push(updated);
//       } catch (updateError) {
//         console.error(
//           `Failed to update component ID ${componentId}: ${updateError.message}`
//         );
//       }
//     }

//     console.log(` Finished processing ${updatedComponents.length} components.`);
//     return updatedComponents;
//   } catch (error) {
//     console.error(" Error in updatePayComponent:", error.message);
//     throw error;
//   }
// };

// Delete pay component

const deletePayComponent = async (id) => {
  try {
    await prisma.hrms_m_pay_component.delete({
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

const getAllPayComponent = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active,
  is_advance
) => {
  try {
    // AUTO-CREATION DISABLED
    // const totalCountCheck = await prisma.hrms_m_pay_component.count();
    // if (totalCountCheck === 0) {
    //   for (const payComponentData of mockPayComponents) {
    //     await prisma.hrms_m_pay_component.create({
    //       data: {
    //         ...serializePayComponentData(payComponentData),
    //         createdby: 1,
    //         createdate: new Date(),
    //         log_inst: 1,
    //       },
    //     });
    //   }
    // }

    page = typeof page === "number" && page > 0 ? page : 1;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          component_name: { contains: search.toLowerCase() },
        },
        {
          component_code: { contains: search.toLowerCase() },
        },
        {
          component_type: { contains: search.toLowerCase() },
        },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    if (is_advance) {
      filters.is_advance = is_advance === "Y" ? "Y" : "N";
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
    const pays = await prisma.hrms_m_pay_component.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      // include: {
      //   pay_component_tax: {
      //     select: {
      //       id: true,
      //       pay_component_id: true,
      //       rule_type: true,
      //     },
      //   },
      //   pay_component_project: {
      //     select: {
      //       id: true,
      //       code: true,
      //       name: true,
      //     },
      //   },

      //   pay_component_cost_center1: {
      //     select: {
      //       id: true,
      //       name: true,
      //       dimension_id: true,
      //     },
      //   },
      //   pay_component_cost_center2: {
      //     select: {
      //       id: true,
      //       name: true,
      //       dimension_id: true,
      //     },
      //   },
      //   pay_component_cost_center3: {
      //     select: {
      //       id: true,
      //       name: true,
      //       dimension_id: true,
      //     },
      //   },
      //   pay_component_cost_center4: {
      //     select: {
      //       id: true,
      //       name: true,
      //       dimension_id: true,
      //     },
      //   },
      //   pay_component_cost_center5: {
      //     select: {
      //       id: true,
      //       name: true,
      //       dimension_id: true,
      //     },
      //   },
      // },
      include: {
        pay_component_tax: true,
        pay_component_project: true,
        pay_component_cost_center1: true,
        pay_component_cost_center2: true,
        pay_component_cost_center3: true,
        pay_component_cost_center4: true,
        pay_component_cost_center5: true,
        pay_component_for_line: true,
        hrms_m_pay_component_formula: true,
      },
    });

    const totalCount = await prisma.hrms_m_pay_component.count({
      where: filters,
    });
    return {
      data: pays,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving pay components", 503);
  }
};

const getPayComponentOptions = async (isAdvance, isOvertimeRelated) => {
  try {
    const whereClause = {};

    if (isAdvance === "true") {
      whereClause.is_advance = "Y";
    }

    if (isOvertimeRelated === "true") {
      whereClause.is_overtime_related = "Y";
    }

    const payComponent = await prisma.hrms_m_pay_component.findMany({
      where: whereClause,
      // include: {
      //   pay_component_tax: {
      //     select: {
      //       id: true,
      //       pay_component_id: true,
      //       rule_type: true,
      //     },
      //   },
      //   pay_component_project: {
      //     select: {
      //       id: true,
      //       code: true,
      //       name: true,
      //     },
      //   },
      //   pay_component_cost_center1: {
      //     select: {
      //       id: true,
      //       name: true,
      //       dimension_id: true,
      //     },
      //   },
      //   pay_component_cost_center2: {
      //     select: {
      //       id: true,
      //       name: true,
      //       dimension_id: true,
      //     },
      //   },
      //   pay_component_cost_center3: {
      //     select: {
      //       id: true,
      //       name: true,
      //       dimension_id: true,
      //     },
      //   },
      //   pay_component_cost_center4: {
      //     select: {
      //       id: true,
      //       name: true,
      //       dimension_id: true,
      //     },
      //   },
      //   pay_component_cost_center5: {
      //     select: {
      //       id: true,
      //       name: true,
      //       dimension_id: true,
      //     },
      //   },
      // },
      include: {
        pay_component_tax: true,
        pay_component_project: true,
        pay_component_cost_center1: true,
        pay_component_cost_center2: true,
        pay_component_cost_center3: true,
        pay_component_cost_center4: true,
        pay_component_cost_center5: true,
        // pay_component_for_line: true,
        hrms_m_pay_component_formula: true,
      },
    });

    return payComponent;
  } catch (error) {
    console.error("Error retrieving pay component options: ", error);
    throw new CustomError("Error retrieving pay component", 503);
  }
};

module.exports = {
  createPayComponent,
  findPayComponentById,
  updatePayComponent,
  deletePayComponent,
  getAllPayComponent,
  getPayComponentOptions,
};
