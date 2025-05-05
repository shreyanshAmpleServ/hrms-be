const projectModel = require('../models/projectModel');

const createProject = async (data) => {
  return await projectModel.createProject(data);
};

const findProjectById = async (id) => {
  return await projectModel.findProjectById(id);
};

const updateProject = async (id, data) => {
  return await projectModel.updateProject(id, data);
};

const deleteProject = async (id) => {
  return await projectModel.deleteProject(id);
};

const getAllProjects = async (search ,page , size ,startDate,endDate) => {
  return await projectModel.getAllProjects(search ,page , size ,startDate,endDate);
};

module.exports = {
  createProject,
  findProjectById,
  updateProject,
  deleteProject,
  getAllProjects,
};
