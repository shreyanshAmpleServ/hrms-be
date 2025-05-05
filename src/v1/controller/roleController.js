const roleService = require('../services/roleService');
const CustomError = require('../../utils/CustomError');

const createRole = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).success('Role created successfully', role);
  } catch (error) {
    next(error);
  }
};

const getRoleById = async (req, res, next) => {
  try {
    const role = await roleService.findRoleById(req.params.id);
    if (!role) throw new CustomError('Role not found', 404);
    res.status(200).success(null, role);
  } catch (error) {
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    res.status(200).success('Role updated successfully', role);
  } catch (error) {
    next(error);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    await roleService.deleteRole(req.params.id);
    res.status(200).success('Role deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAllRoles = async (req, res, next) => {
  try {
    const roles = await roleService.getAllRoles();
    res.status(200).success(null, roles);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  getAllRoles,
};
