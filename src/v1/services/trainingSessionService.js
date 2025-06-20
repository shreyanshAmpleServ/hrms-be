const trainingSessionModel = require("../models/trainingSessionModel.js");

// Service to create a training session
const createTrainingSession = async (data) => {
  return await trainingSessionModel.createTrainingSession(data);
};

// Service to get a training session by ID
const getTrainingSessionById = async (id) => {
  return await trainingSessionModel.findTrainingSessionById(id);
};

// Service to update a training session
const updateTrainingSession = async (id, data) => {
  return await trainingSessionModel.updateTrainingSession(id, data);
};

// Service to delete a training session
const deleteTrainingSession = async (id) => {
  return await trainingSessionModel.deleteTrainingSession(id);
};

// Service to get all training sessions
const getAllTrainingSession = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await trainingSessionModel.getAllTrainingSessions(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const updateTrainingSessionStatus = async (id, data) => {
  return await trainingSessionModel.updateTrainingSessionStatus(id, data);
};
module.exports = {
  createTrainingSession,
  getTrainingSessionById,
  updateTrainingSession,
  deleteTrainingSession,
  getAllTrainingSession,
  updateTrainingSessionStatus,
};
