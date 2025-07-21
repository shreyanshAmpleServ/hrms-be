const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeTaxData = (data) => ({
  pay_component_id: parseInt(data.pay_component_id) || null,
  rule_type: data.rule_type || "",
  slab_min: Number(data.slab_min) || null,
  slab_max: Number(data.slab_max) || null,
  rate: Number(data.rate) || null,
  flat_amount: Number(data.flat_amount) || null,
  formula_text: data.formula_text || "",
  effective_from: data.effective_from || "",
  effective_to: data.effective_to || "",
  is_active: data.is_active || "Y",
});
// Create a new tax
// const createTaxSlab = async (data) => {
//   try {
//     const tax = await prisma.hrms_m_tax_slab_rule.create({
//       data: {
//         ...serializeTaxData(data),
//         log_inst: data.log_inst || 1,
//         createdate: new Date(),
//         updatedate: new Date(),
//         updatedby: data.createdby || 1,
//         createdby: data.createdby || 1,
//       },
//       include: {
//         pay_component_line_tax_slab: true,
//         tax_slab_pay_component: true,
//       },
//     });
//     return tax;
//   } catch (error) {
//     console.log("Error tax Slab Modal Create : ", error);
//     throw new CustomError(`Error creating tax: ${error.message}`, 500);
//   }
// };

// const createTaxSlab = async (data) => {
//   try {
//     const parentTax = await prisma.hrms_m_tax_slab_rule.create({
//       data: {
//         code: data.code,
//         name: data.name,
//         pay_component_id: parseInt(data.pay_component_id) || null,
//         formula_text: data.formula_text || "",
//         is_active: data.is_active || "Y",
//         createdate: new Date(),
//         updatedate: new Date(),
//         createdby: data.createdby || 1,
//         updatedby: data.createdby || 1,
//         log_inst: data.log_inst || 1,
//       },
//     });

//     const childTaxSlabs = data.childTaxSlabs.map((child) => ({
//       parent_id: parentTax.id,
//       rule_type: child.rule_type || "",
//       slab_min: Number(child.slab_min) || 0,
//       slab_max: Number(child.slab_max) || 0,
//       rate: Number(child.rate) || 0,
//       flat_amount: Number(child.flat_amount) || 0,
//       effective_from: new Date(child.effective_from),
//       effective_to: child.effective_to ? new Date(child.effective_to) : null,
//       createdate: new Date(),
//       updatedate: new Date(),
//       createdby: data.createdby || 1,
//       updatedby: data.createdby || 1,
//       log_inst: data.log_inst || 1,
//     }));

//     await prisma.hrms_m_tax_slab_rule1.createMany({
//       data: childTaxSlabs,
//     });

//     const createdChildTaxSlabs = await prisma.hrms_m_tax_slab_rule1.findMany({
//       where: {
//         parent_id: parentTax.id,
//       },
//     });

//     return {
//       ...data,
//       children: createdChildTaxSlabs,
//     };
//   } catch (error) {
//     console.error("Error creating tax slabs: ", error);
//     throw new CustomError(`Error creating tax slabs: ${error.message}`, 500);
//   }
// };

const createTaxSlab = async (data) => {
  try {
    if (!/^\d+$/.test(data.code)) {
      throw new CustomError("Code must be numeric.", 400);
    }
    const existing = await prisma.hrms_m_tax_slab_rule.findFirst({
      where: {
        OR: [{ code: data.code }, { name: data.name }],
      },
    });

    if (existing) {
      if (existing.code === data.code) {
        throw new CustomError("Code must be unique", 400);
      } else {
        throw new CustomError("Code must be unique", 400);
      }
    }
    const parentTax = await prisma.hrms_m_tax_slab_rule.create({
      data: {
        code: data.code,
        name: data.name,
        pay_component_id: parseInt(data.pay_component_id) || null,
        formula_text: data.formula_text || "",
        is_active: data.is_active || "Y",
        createdate: new Date(),
        updatedate: new Date(),
        createdby: data.createdby || 1,
        updatedby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
      include: {
        hrms_m_tax_slab_rule1: true,
      },
    });

    const childTaxSlabs = data.childTaxSlabs.map((child) => ({
      parent_id: parentTax.id,
      rule_type: child.rule_type || "",
      slab_min: Number(child.slab_min) || 0,
      slab_max: Number(child.slab_max) || 0,
      rate: Number(child.rate) || 0,
      flat_amount: Number(child.flat_amount) || 0,
      effective_from: new Date(child.effective_from),
      effective_to: child.effective_to ? new Date(child.effective_to) : null,
      createdate: new Date(),
      updatedate: new Date(),
      createdby: data.createdby || 1,
      updatedby: data.createdby || 1,
      log_inst: data.log_inst || 1,
    }));

    console.log("Child Tax Slabs Data:", childTaxSlabs);

    const createdChildren = await prisma.hrms_m_tax_slab_rule1.createMany({
      data: childTaxSlabs,
    });

    console.log("Created Child Tax Slabs:", createdChildren);

    const createdChildTaxSlabs = await prisma.hrms_m_tax_slab_rule1.findMany({
      where: {
        parent_id: parentTax.id,
      },
    });

    console.log("Fetched Child Tax Slabs:", createdChildTaxSlabs);

    return {
      ...parentTax,
      hrms_m_tax_slab_rule1: createdChildTaxSlabs,
    };
  } catch (error) {
    console.error("Error creating tax slabs: ", error);
    throw new CustomError(`Error creating tax slabs: ${error.message}`, 500);
  }
};

// Update a tax
// const updateTaxSlab = async (id, data) => {
//   try {
//     const updatedTax = await prisma.hrms_m_tax_slab_rule.update({
//       where: { id: parseInt(id) },
//       data: {
//         name: data.name,
//         code: data.code,
//         formula_text: data.formula_text,
//         is_active: data.is_active || "Y",
//         updatedate: new Date(),
//         updatedby: data.updatedby || 1,
//         tax_slab_pay_component: {
//           connect: { id: data.pay_component_id },
//         },
//       },
//       include: {
//         hrms_m_tax_slab_rule1: true,
//       },
//     });

//     return updatedTax;
//   } catch (error) {
//     console.error("tax Update error:", error);
//     throw new CustomError(`Error updating tax: ${error.message}`, 500);
//   }
// };

// const updateTaxSlab = async (id, data) => {
//   try {
//     let taxRule;

//     // Parent: Upsert
//     if (id) {
//       taxRule = await prisma.hrms_m_tax_slab_rule.update({
//         where: { id: parseInt(id) },
//         data: {
//           name: data.name,
//           code: data.code,
//           formula_text: data.formula_text,
//           is_active: data.is_active || "Y",
//           updatedate: new Date(),
//           updatedby: data.updatedby || 1,
//           tax_slab_pay_component: {
//             connect: { id: data.pay_component_id },
//           },
//         },
//       });
//     } else {
//       taxRule = await prisma.hrms_m_tax_slab_rule.create({
//         data: {
//           name: data.name,
//           code: data.code,
//           formula_text: data.formula_text,
//           is_active: data.is_active || "Y",
//           createdate: new Date(),
//           createdby: data.createdby || 1,
//           updatedate: new Date(),
//           updatedby: data.updatedby || 1,
//           tax_slab_pay_component: {
//             connect: { id: data.pay_component_id },
//           },
//         },
//       });
//     }

//     const parentId = taxRule.id;

//     // Children: Upsert each
//     if (Array.isArray(data.childSlabs)) {
//       for (const child of data.childSlabs) {
//         if (child.id) {
//           // Update existing child
//           await prisma.hrms_m_tax_slab_rule1.update({
//             where: { id: child.id },
//             data: {
//               rule_type: child.rule_type,
//               slab_min: child.slab_min,
//               slab_max: child.slab_max,
//               rate: child.rate,
//               flat_amount: child.flat_amount,
//               effective_from: new Date(child.effective_from),
//               effective_to: child.effective_to
//                 ? new Date(child.effective_to)
//                 : null,
//               updatedate: new Date(),
//               updatedby: data.updatedby || 1,
//             },
//           });
//         } else {
//           // Create new child
//           await prisma.hrms_m_tax_slab_rule1.create({
//             data: {
//               parent_id: parentId,
//               rule_type: child.rule_type,
//               slab_min: child.slab_min,
//               slab_max: child.slab_max,
//               rate: child.rate,
//               flat_amount: child.flat_amount,
//               effective_from: new Date(child.effective_from),
//               effective_to: child.effective_to
//                 ? new Date(child.effective_to)
//                 : null,
//               createdate: new Date(),
//               createdby: data.updatedby || 1,
//               updatedate: new Date(),
//               updatedby: data.updatedby || 1,
//             },
//           });
//         }
//       }
//     }

//     // Return updated or created parent with children
//     const result = await prisma.hrms_m_tax_slab_rule.findUnique({
//       where: { id: parentId },
//       include: {
//         hrms_m_tax_slab_rule1: true,
//       },
//     });

//     return result;
//   } catch (error) {
//     console.error("Tax Slab Upsert Error:", error);
//     throw new CustomError(`Error upserting tax slab: ${error.message}`, 500);
//   }
// };

const updateTaxSlab = async (id, data) => {
  try {
    let taxRule;

    if (id) {
      taxRule = await prisma.hrms_m_tax_slab_rule.update({
        where: { id: parseInt(id) },
        data: {
          name: data.name,
          code: data.code,
          formula_text: data.formula_text,
          is_active: data.is_active || "Y",
          updatedate: new Date(),
          updatedby: data.updatedby || 1,
          tax_slab_pay_component: {
            connect: { id: data.pay_component_id },
          },
        },
      });
    } else {
      taxRule = await prisma.hrms_m_tax_slab_rule.create({
        data: {
          name: data.name,
          code: data.code,
          formula_text: data.formula_text,
          is_active: data.is_active || "Y",
          createdate: new Date(),
          createdby: data.createdby || 1,
          updatedate: new Date(),
          updatedby: data.updatedby || 1,
          tax_slab_pay_component: {
            connect: { id: data.pay_component_id },
          },
        },
      });
    }

    const parentId = taxRule.id;

    if (Array.isArray(data.childSlabs)) {
      for (const child of data.childSlabs) {
        if (child.id) {
          await prisma.hrms_m_tax_slab_rule1.update({
            where: { id: child.id },
            data: {
              rule_type: child.rule_type,
              slab_min: child.slab_min,
              slab_max: child.slab_max,
              rate: child.rate,
              flat_amount: child.flat_amount,
              effective_from: new Date(child.effective_from),
              effective_to: child.effective_to
                ? new Date(child.effective_to)
                : null,
              updatedate: new Date(),
              updatedby: data.updatedby || 1,
            },
          });
        } else {
          if (!child.code) {
            throw new Error("Child slab 'code' is required for creation.");
          }

          await prisma.hrms_m_tax_slab_rule1.create({
            data: {
              parent_id: parentId,
              code: child.code,
              rule_type: child.rule_type,
              slab_min: child.slab_min,
              slab_max: child.slab_max,
              rate: child.rate,
              flat_amount: child.flat_amount,
              effective_from: new Date(child.effective_from),
              effective_to: child.effective_to
                ? new Date(child.effective_to)
                : null,
              createdate: new Date(),
              createdby: data.updatedby || 1,
              updatedate: new Date(),
              updatedby: data.updatedby || 1,
            },
          });
        }
      }
    }

    const result = await prisma.hrms_m_tax_slab_rule.findUnique({
      where: { id: parentId },
      include: {
        hrms_m_tax_slab_rule1: true,
      },
    });

    return result;
  } catch (error) {
    console.error("Tax Slab Upsert Error:", error);
    throw new CustomError(`Error upserting tax slab: ${error.message}`, 500);
  }
};

const findTaxSlabById = async (id) => {
  try {
    const tax = await prisma.hrms_m_tax_slab_rule.findUnique({
      where: { id: parseInt(id) },
      // include:{
      //   Account:{
      //     select:{
      //       firstName:true,
      //       lastName:true,
      //       id:true
      //     }
      //   },

      // },
    });
    return tax;
  } catch (error) {
    console.log("Error in Details of tax ", error);
    throw new CustomError(`Error finding tax by ID: ${error.message}`, 503);
  }
};

// Delete a taxs
const deleteTaxSlab = async (id) => {
  try {
    await prisma.hrms_m_tax_slab_rule1.deleteMany({
      where: { parent_id: parseInt(id) },
    });
    await prisma.hrms_m_tax_slab_rule.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting tax: ${error.message}`, 500);
  }
};

// Get all taxs and include their roles
// const getAllTaxSlab = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate,
//   is_active
// ) => {
//   try {
//     page = !page || page <= 0 ? 1 : page;
//     size = size || 10;
//     const skip = (page - 1) * size;

//     const filters = {};

//     if (search) {
//       filters.OR = [
//         { pay_component_id: { contains: search.toLowerCase() } },
//         { rule_type: { contains: search.toLowerCase() } },
//         { formula_text: { contains: search.toLowerCase() } },
//       ];
//     }
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       filters.request_date = { gte: start, lte: end };
//     }
//     if (typeof is_active === "boolean") {
//       filters.is_active = is_active ? "Y" : "N";
//     } else if (typeof is_active === "string") {
//       if (is_active.toLowerCase() === "true") filters.is_active = "Y";
//       else if (is_active.toLowerCase() === "false") filters.is_active = "N";
//     }
//     if (typeof is_active === "boolean") {
//       filters.is_active = is_active ? "Y" : "N";
//     } else if (typeof is_active === "string") {
//       if (is_active.toLowerCase() === "true") filters.is_active = "Y";
//       else if (is_active.toLowerCase() === "false") filters.is_active = "N";
//     }
//     const taxs = await prisma.hrms_m_tax_slab_rule.findMany({
//       where: filters,
//       skip,
//       take: size,
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//       include: {
//         pay_component_line_tax_slab: true,
//       },
//     });

//     return taxs;
//   } catch (error) {
//     throw new CustomError("Error retrieving Taxs", 503);
//   }
// };

const getAllTaxSlab = async (
  search,
  page,
  size,
  startDate,
  endDate,
  is_active,
  id // <-- add id as an optional parameter
) => {
  try {
    // If id is provided, fetch and return that record with relations
    if (id) {
      const tax = await prisma.hrms_m_tax_slab_rule.findUnique({
        where: { id: parseInt(id) },
        include: {
          hrms_m_tax_slab_rule1: true,
          tax_slab_pay_component: true,
          pay_component_tax: true,
        },
      });
      return {
        data: tax,
        currentPage: 1,
        size: 1,
        totalPages: 1,
        totalCount: tax ? 1 : 0,
      };
    }

    // Otherwise, fetch paginated list
    page = !page || page <= 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};

    // Search filters
    if (search) {
      filters.OR = [
        { rule_type: { contains: search.toLowerCase() } },
        { formula_text: { contains: search.toLowerCase() } },
        isNaN(Number(search))
          ? undefined
          : { pay_component_id: { equals: Number(search) } },
      ].filter(Boolean);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);

      filters.request_date = { gte: start, lte: end };
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const taxs = await prisma.hrms_m_tax_slab_rule.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hrms_m_tax_slab_rule1: true,
        tax_slab_pay_component: true,
        pay_component_tax: true,
      },
    });

    const totalCount = await prisma.hrms_m_tax_slab_rule.count({
      where: filters,
    });

    return {
      data: taxs,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.error("Error in getAllTaxSlab:", error);
    throw new CustomError("Error retrieving Tax Slabs", 503);
  }
};

module.exports = {
  createTaxSlab,
  findTaxSlabById,
  updateTaxSlab,
  deleteTaxSlab,
  getAllTaxSlab,
};
