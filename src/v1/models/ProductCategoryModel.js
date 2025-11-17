const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

// Create a new Category
const createProductCategory = async (data) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const Category = await prisma.crms_m_product_category.create({
      data: {
        name: data.name,
        // description: data.description || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });
    return Category;
  } catch (error) {
    throw new CustomError(`Error creating Category: ${error.message}`, 500);
  }
};

// Find an Category by ID
const findCategoryById = async (id) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const Category = await prisma.crms_m_product_category.findUnique({
      where: { id: parseInt(id) },
    });
    if (!Category) {
      throw new CustomError("Category not found", 404);
    }
    return Category;
  } catch (error) {
    throw new CustomError(
      `Error finding Category by ID: ${error.message}`,
      503
    );
  }
};

// Update an Category
const updateProductCategory = async (id, data) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const updatedCategory = await prisma.crms_m_product_category.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedCategory;
  } catch (error) {
    throw new CustomError(`Error updating Category: ${error.message}`, 500);
  }
};

// Delete an Category
const deleteProductCategory = async (id) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    await prisma.crms_m_product_category.delete({
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

// Get all crms_m_product_category
const getAllProductCategory = async () => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const productCategory = await prisma.crms_m_product_category.findMany({
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    return productCategory;
  } catch (error) {
    throw new CustomError("Error retrieving industries", 503);
  }
};

module.exports = {
  createProductCategory,
  findCategoryById,
  updateProductCategory,
  deleteProductCategory,
  getAllProductCategory,
};
