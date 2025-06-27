const projectService = require("../services/projectService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).success("Project created successfully", project);
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.findProjectById(req.params.id);
    if (!project) throw new CustomError("Project not found", 404);
    res.status(200).success(null, project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.status(200).success("Project updated successfully", project);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.status(200).success("Project deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const projects = await projectService.getAllProjects(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      is_active
    );
    res.status(200).success(null, projects);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjects,
};
