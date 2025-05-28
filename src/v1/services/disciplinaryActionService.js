const disciplinaryActionModel = require("../models/disciplinaryActionModel.js");
const createDisciplinaryAction = async (data) => {
  return await disciplinaryActionModel.createDisciplinaryAction(data);
};

const getDisciplinaryActionById = async (id) => {
  return await disciplinaryActionModel.findDisciplinaryActionById(id);
};

const updateDisciplinaryAction = async (id, data) => {
  return await disciplinaryActionModel.updateDisciplinaryAction(id, data);
};

const deleteDisciplinaryAction = async (id) => {
  return await disciplinaryActionModel.deleteDisciplinaryAction(id);
};

const getAllDisciplinaryActions = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await disciplinaryActionModel.getAllDisciplinaryAction(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createDisciplinaryAction,
  getDisciplinaryActionById,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
  getAllDisciplinaryActions,
};
