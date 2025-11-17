const taxSlabModal = require("../models/taxSlabModal");
const { getPrisma } = require("../../config/prismaContext.js");

const createTaxSlab = async (data) => {
  return await taxSlabModal.createTaxSlab(data);
};

const findTaxSlabById = async (id) => {
  return await taxSlabModal.findTaxSlabById(id);
};

const updateTaxSlab = async (id, data) => {
  return await taxSlabModal.updateTaxSlab(id, data);
};

const deleteTaxSlab = async (id) => {
  return await taxSlabModal.deleteTaxSlab(id);
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
  return await taxSlabModal.getAllTaxSlab(
    search,
    page,
    size,
    startDate,
    endDate,
    is_active,
    id
  );
};

module.exports = {
  createTaxSlab,
  findTaxSlabById,
  updateTaxSlab,
  deleteTaxSlab,
  getAllTaxSlab,
};
