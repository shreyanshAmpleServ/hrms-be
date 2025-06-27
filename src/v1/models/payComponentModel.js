const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { toLowerCase } = require("zod/v4");
const prisma = new PrismaClient();

// Serialize pay component data
const serializePayComponentData = (data) => ({
  component_name: data.component_name || "",
  component_code: data.component_code || "",
  component_type: data.component_type || "",
  is_taxable: data.is_taxable || "Y",
  is_statutory: data.is_statutory || "N",
  is_active: data.is_active || "Y",
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
    return reqData;
  } catch (error) {
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
const updatePayComponent = async (id, data) => {
  try {
    const totalCount = await prisma.hrms_m_pay_component.count({
      where: {
        OR: [
          { component_name: toLowerCase(data.component_name) },
          { component_code: toLowerCase(data.component_code) },
        ],
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
    });
    return updatedEntry;
  } catch (error) {
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

// Get all pay components with pagination and search
// const getAllPayComponent = async (search, page, size, startDate, endDate) => {
//   try {
//     page = !page || page == 0 ? 1 : page;
//     size = size || 10;
//     const skip = (page - 1) * size || 0;

//     const filters = {};
//     if (search) {
//       filters.OR = [
//         { component_name: { contains: search.toLowerCase() } },
//         { component_code: { contains: search.toLowerCase() } },
//         { component_type: { contains: search.toLowerCase() } },
//       ];
//     }
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         filters.createdate = { gte: start, lte: end };
//       }
//     }

//     const datas = await prisma.hrms_m_pay_component.findMany({
//       where: filters,
//       skip,
//       take: size,
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//     });
//     const totalCount = await prisma.hrms_m_pay_component.count({
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
//     throw new CustomError("Error retrieving pay components", 503);
//   }
// };
const getAllPayComponent = async (page, size, search, startDate, endDate) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        // {
        //   campaign_user: {
        //     full_name: { contains: search.toLowerCase() },
        //   }, // Include contact details
        // },
        // {
        //   campaign_leads: {
        //     title: { contains: search.toLowerCase() },
        //   }, // Include contact details
        // },
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

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = {
          gte: start,
          lte: end,
        };
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

module.exports = {
  createPayComponent,
  findPayComponentById,
  updatePayComponent,
  deletePayComponent,
  getAllPayComponent,
};
