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
        tax_slab_pay_component: true,
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

const updateTaxSlab = async (id, data) => {
  try {
    console.log("Updating parent tax slab with id:", id, "and data:", data);

    const taxRule = await prisma.hrms_m_tax_slab_rule.update({
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

    console.log("Updated parent tax slab:", taxRule);

    const parentId = taxRule.id;
    const incoming = Array.isArray(data.childTaxSlabs)
      ? data.childTaxSlabs
      : [];
    console.log("Incoming child slabs:", incoming);

    for (const child of incoming) {
      if (child.id) {
        console.log("Updating child slab:", child.id, child);
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
        console.log("Creating new child slab:", child);
        await prisma.hrms_m_tax_slab_rule1.create({
          data: {
            parent_id: parentId,
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

    const result = await prisma.hrms_m_tax_slab_rule.findUnique({
      where: { id: parentId },
      include: {
        hrms_m_tax_slab_rule1: true,
        tax_slab_pay_component: true,
      },
    });

    console.log("Final result after update:", result);

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

const getAllTaxSlab = async (
  search,
  page,
  size,
  startDate,
  endDate,
  is_active,
  id
) => {
  try {
    if (id) {
      const tax = await prisma.hrms_m_tax_slab_rule.findUnique({
        where: { id: parseInt(id) },
        include: {
          hrms_m_tax_slab_rule1: true,
          tax_slab_pay_component: true,
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

    page = !page || page <= 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};

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
