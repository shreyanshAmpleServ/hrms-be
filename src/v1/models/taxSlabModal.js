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
const createTaxSlab = async (data) => {
  try {
    const tax = await prisma.hrms_m_tax_slab_rule.create({
      data: {
        ...serializeTaxData(data),
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: data.createdby || 1,
        createdby: data.createdby || 1,
      },
    });
    return tax;
  } catch (error) {
    console.log("Error tax Slab Modal Create : ", error);
    throw new CustomError(`Error creating tax: ${error.message}`, 500);
  }
};

// Update a tax
const updateTaxSlab = async (id, data) => {
  try {
    const updatedTax = await prisma.hrms_m_tax_slab_rule.update({
      where: { id: parseInt(id) },
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
const getAllTaxSlab = async () => {
  try {
    const taxs = await prisma.hrms_m_tax_slab_rule.findMany({
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    return taxs;
  } catch (error) {
    throw new CustomError("Error retrieving Taxs", 503);
  }
};

module.exports = {
  createTaxSlab,
  findTaxSlabById,
  updateTaxSlab,
  deleteTaxSlab,
  getAllTaxSlab,
};
