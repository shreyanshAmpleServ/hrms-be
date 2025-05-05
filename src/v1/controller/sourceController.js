const sourceService = require('../services/sourceService');
const CustomError = require('../../utils/CustomError');

const createSource = async (req, res, next) => {
  try {
    const source = await sourceService.createSource(req.body);
    res.status(201).success('Source created successfully', source);
  } catch (error) {
    next(error);
  }
};

const getSourceById = async (req, res, next) => {
  try {
    const source = await sourceService.findSourceById(req.params.id);
    if (!source) throw new CustomError('Source not found', 404);
    res.status(200).success(null, source);
  } catch (error) {
    next(error);
  }
};

const updateSource = async (req, res, next) => {
  try {
    const source = await sourceService.updateSource(req.params.id, req.body);
    res.status(200).success('Source updated successfully', source);
  } catch (error) {
    next(error);
  }
};

const deleteSource = async (req, res, next) => {
  try {
    await sourceService.deleteSource(req.params.id);
    res.status(200).success('Source deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAllSources = async (req, res, next) => {
  try {
    const sources = await sourceService.getAllSources();
    res.status(200).success(null, sources);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSource,
  getSourceById,
  updateSource,
  deleteSource,
  getAllSources,
};
