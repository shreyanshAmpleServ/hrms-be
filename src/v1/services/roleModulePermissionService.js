const permissionsModel = require('../models/roleModulePermissionModel');

const createPermission = async (data) => {
  return await permissionsModel.createPermission(data);
};

const findContactById = async (id) => {
  return await permissionsModel.findContactById(id);
};

const updateContact = async (id, data) => {
  return await permissionsModel.updateContact(id, data);
};

const deleteContact = async (id) => {
  return await permissionsModel.deleteContact(id);
};

const getAllPermission = async (role_id) => {
  return await permissionsModel.getAllPermission(role_id);
};

module.exports = {
  createPermission,
  findContactById,
  updateContact,
  deleteContact,
  getAllPermission,
};
