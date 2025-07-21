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
const updateTaxSlab = async (id, data) => {
  try {
    const updatedTax = await prisma.hrms_m_tax_slab_rule.update({
      where: { id: parseInt(id) },
      include: {
        pay_component_line_tax_slab: true,
        tax_slab_pay_component: {
          include: {
            id: true,
            component_name: true,
          },
        },
      },
      data: {
        ...serializeTaxData(data),
        updatedate: new Date(),
        updatedby: data.updatedby || 1,
      },
    });

    return updatedTax;
  } catch (error) {
    console.log("tax Update error : ", error);
    throw new CustomError(`Error updating tax: ${error.message}`, 500);
  }
};

// Find a tax by ID and include role
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

// Delete a tax
const deleteTaxSlab = async (id) => {
  try {
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
  is_active
) => {
  try {
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
        pay_component_line_tax_slab: true,
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
