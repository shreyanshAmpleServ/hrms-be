const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { toLowerCase } = require("zod/v4");
const { id } = require("date-fns/locale");
const prisma = new PrismaClient();

// Serialize pay component data
const serializePayComponentData = (data) => ({
  component_name: data.component_name || "",
  component_code: data.component_code || "",
  component_type: data.component_type || "",
  is_taxable: data.is_taxable || "Y",
  is_statutory: data.is_statutory || "N",
  is_active: data.is_active || "Y",
  is_loan: data.is_loan || "N",
  pay_or_deduct: data.pay_or_deduct || "P",
  is_worklife_related: data.is_worklife_related || "N",
  is_grossable: data.is_grossable || "N",
  is_advance: data.is_advance || "N",
  tax_code_id: data.tax_code_id ? Number(data.tax_code_id) : null,
  gl_account_id: data.gl_account_id ? Number(data.gl_account_id) : null,
  factor: data.factor ? Number(data.factor) : null,
  payable_glaccount_id: data.payable_glaccount_id
    ? Number(data.payable_glaccount_id)
    : null,
  project_id: data.project_id ? Number(data.project_id) : null,
  cost_center1_id: data.cost_center1_id ? Number(data.cost_center1_id) : null,
  cost_center2_id: data.cost_center2_id ? Number(data.cost_center2_id) : null,
  cost_center3_id: data.cost_center3_id ? Number(data.cost_center3_id) : null,
  cost_center4_id: data.cost_center4_id ? Number(data.cost_center4_id) : null,
  cost_center5_id: data.cost_center5_id ? Number(data.cost_center5_id) : null,
  column_order: data.column_order ? Number(data.column_order) : null,
  execution_order: data.execution_order ? Number(data.execution_order) : null,
  visible_in_payslip: data.visible_in_payslip || "",
  default_formula: data.default_formula || "",
  formula_editable: data.formula_editable || "",
  is_recurring: data.is_recurring || "",
  component_subtype: data.component_subtype || "",
  is_overtime_related: data.is_overtime_related || "N",
  contributes_to_paye: data.contributes_to_paye || "N",
  contributes_to_nssf: data.contributes_to_nssf || "N",
  auto_fill: data.auto_fill || "N",
  unpaid_leave: data.unpaid_leave || "N",
});

// Create a new pay component
const createPayComponent = async (data) => {
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
    const result = await prisma.$transaction(async (prisma) => {
      const reqData = await prisma.hrms_m_pay_component.create({
        data: {
          ...serializePayComponentData(data),
          createdby: data.createdby || 1,
          createdate: new Date(),
          log_inst: data.log_inst || 1,
        },
        include: {
          pay_component_tax: {
            select: {
              id: true,
              pay_component_id: true,
              rule_type: true,
            },
          },
          pay_component_project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          // pay_component_for_line: {
          //   select: {
          //     id: true,
          //     component_name: true,
          //     component_code: true,
          //     component_type: true,
          //   },
          // },
          pay_component_cost_center1: {
            select: {
              id: true,
              name: true,
              dimension_id: true,
            },
          },
          pay_component_cost_center2: {
            select: {
              id: true,
              name: true,
              dimension_id: true,
            },
          },
          pay_component_cost_center3: {
            select: {
              id: true,
              name: true,
              dimension_id: true,
            },
          },
          pay_component_cost_center4: {
            select: {
              id: true,
              name: true,
              dimension_id: true,
            },
          },
          pay_component_cost_center5: {
            select: {
              id: true,
              name: true,
              dimension_id: true,
            },
          },
        },
      });
      // Step 2: Dynamically add column to monthly payroll table
      // const columnName = prisma.sql([`"${data.component_code}"`]); // Safe quoting
      // const alterQuery = prisma.raw(`
      //   ALTER TABLE monthly_payroll_processing
      //   ADD COLUMN ${data.component_code} VARCHAR(255) DEFAULT NULL;
      // `);

      if (!/^\d+$/.test(data.component_code)) {
        throw new Error("Invalid column name. Must be numeric.");
      }

      await prisma.$executeRawUnsafe(`
  ALTER TABLE hrms_d_monthly_payroll_processing
  ADD [${data.component_code}] DECIMAL(18,4) NULL
`);
      return reqData;
    });
    return result;
  } catch (error) {
    if (error.code === "23505" || error.message.includes("already exists")) {
      throw new CustomError(
        `Component code already used as column in payroll processing`,
        400
      );
    }
    throw new CustomError(
      `Error creating pay component: ${error.message}`,
      500
    );
  }
};

// Find pay component by ID
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

// Update pay component
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
//             component_name: true,
//             component_code: true,
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

const updatePayComponent = async (id, data) => {
  const componentId = parseInt(id);

  if (!/^\d+$/.test(data.component_code)) {
    throw new CustomError("Invalid component code. Must be numeric.", 400);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check for duplicates (excluding the current record)
      const duplicateCount = await tx.hrms_m_pay_component.count({
        where: {
          id: { not: componentId },
          OR: [
            { component_name: toLowerCase(data.component_name) },
            { component_code: toLowerCase(data.component_code) },
          ],
        },
      });

      if (duplicateCount > 0) {
        throw new CustomError(
          "Pay component with the same name or code already exists.",
          400
        );
      }

      // 2. Try adding new column to payroll table (ignore if exists)
      try {
        await tx.$executeRawUnsafe(`
          ALTER TABLE hrms_d_monthly_payroll_processing
          ADD [${data.component_code}] DECIMAL(18,4) NULL
        `);
        console.log(`Successfully created column ${data.component_code}`);
      } catch (sqlError) {
        if (
          sqlError.message.includes("duplicate") ||
          sqlError.message.includes("already exists")
        ) {
          console.log(`Column ${data.component_code} already exists`);
        } else {
          throw new CustomError(
            `Failed to alter payroll processing table: ${sqlError.message}`,
            500
          );
        }
      }

      const updatedEntry = await tx.hrms_m_pay_component.update({
        where: { id: componentId },
        data: {
          ...serializePayComponentData(data),
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
        include: {
          pay_component_tax: {
            select: {
              id: true,
              pay_component_id: true,
              rule_type: true,
            },
          },
          pay_component_project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          pay_component_for_line: {
            select: {
              id: true,
              component_type: true,
            },
          },
          pay_component_cost_center1: {
            select: {
              id: true,
              name: true,
              dimension_id: true,
            },
          },
          pay_component_cost_center2: {
            select: {
              id: true,
              name: true,
              dimension_id: true,
            },
          },
          pay_component_cost_center3: {
            select: {
              id: true,
              name: true,
              dimension_id: true,
            },
          },
          pay_component_cost_center4: {
            select: {
              id: true,
              name: true,
              dimension_id: true,
            },
          },
          pay_component_cost_center5: {
            select: {
              id: true,
              name: true,
              dimension_id: true,
            },
          },
        },
      });

      return updatedEntry;
    });

    return result;
  } catch (error) {
    console.error("Error in updatePayComponent:", error.message);
    throw new CustomError(
      `Error updating pay component: ${error.message}`,
      500
    );
  }
};

// Delete pay component
const deletePayComponent = async (id) => {
  try {
    await prisma.hrms_m_pay_component.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting pay component: ${error.message}`,
      500
    );
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
      include: {
        pay_component_tax: {
          select: {
            id: true,
            pay_component_id: true,
            rule_type: true,
          },
        },
        pay_component_project: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },

        pay_component_cost_center1: {
          select: {
            id: true,
            name: true,
            dimension_id: true,
          },
        },
        pay_component_cost_center2: {
          select: {
            id: true,
            name: true,
            dimension_id: true,
          },
        },
        pay_component_cost_center3: {
          select: {
            id: true,
            name: true,
            dimension_id: true,
          },
        },
        pay_component_cost_center4: {
          select: {
            id: true,
            name: true,
            dimension_id: true,
          },
        },
        pay_component_cost_center5: {
          select: {
            id: true,
            name: true,
            dimension_id: true,
          },
        },
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

// const getPayComponentOptions = async (isAdvance) => {
//   try {
//     const payComponent = await prisma.hrms_m_pay_component.findMany({
//       where: isAdvance === "true" ? { is_advance: "Y" } : {},

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

//     return payComponent;
//   } catch (error) {
//     console.error("Error retrieving pay component options: ", error);
//     throw new CustomError("Error retrieving pay component", 503);
//   }
// };
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
      include: {
        pay_component_tax: {
          select: {
            id: true,
            pay_component_id: true,
            rule_type: true,
          },
        },
        pay_component_project: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        pay_component_cost_center1: {
          select: {
            id: true,
            name: true,
            dimension_id: true,
          },
        },
        pay_component_cost_center2: {
          select: {
            id: true,
            name: true,
            dimension_id: true,
          },
        },
        pay_component_cost_center3: {
          select: {
            id: true,
            name: true,
            dimension_id: true,
          },
        },
        pay_component_cost_center4: {
          select: {
            id: true,
            name: true,
            dimension_id: true,
          },
        },
        pay_component_cost_center5: {
          select: {
            id: true,
            name: true,
            dimension_id: true,
          },
        },
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
