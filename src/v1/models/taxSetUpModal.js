const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Create a new tax
const createTaxSetup = async (data) => {
  try {
    console.log("Create Tax setUp : ", data);
    // Create the tax
    const tax = await prisma.crms_m_tax_setup.create({
      data: {
        ...data,
        account_id: Number(data?.account_id) || null,
        is_active: data.is_active || "Y",
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: data.createdby || 1,
        createdby: data.createdby || 1,
      },
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
    console.log("Error tax SetUp Modal Create : ", error);
    throw new CustomError(`Error creating tax: ${error.message}`, 500);
  }
};

// Update a tax
const updateTaxSetup = async (id, data) => {
  try {
    const updatedTax = await prisma.crms_m_tax_setup.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        account_id: Number(data?.account_id),
        updatedate: new Date(),
        updatedby: data.updatedby || 1,
      },
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

    return updatedTax;
  } catch (error) {
    console.log("tax Update error : ", error);
    throw new CustomError(`Error updating tax: ${error.message}`, 500);
  }
};

// Find a tax by ID and include role
const findTaxSetupById = async (id) => {
  try {
    const tax = await prisma.crms_m_tax_setup.findUnique({
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
const deleteSetup = async (id) => {
  try {
    await prisma.crms_m_tax_setup.delete({
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

// Get all taxs and include their roles
const getAllTaxSetup = async () => {
  try {
    const taxs = await prisma.crms_m_tax_setup.findMany({
      // include:{
      //   Account:{
      //     select:{
      //       firstName:true,
      //       lastName:true,
      //       id:true
      //     }
      //   },

      // },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    // Fetch roles for each tax
    return taxs;
  } catch (error) {
    throw new CustomError("Error retrieving Taxs", 503);
  }
};

module.exports = {
  createTaxSetup,
  findTaxSetupById,
  updateTaxSetup,
  deleteSetup,
  getAllTaxSetup,
};
