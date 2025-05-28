// const disciplinaryActionModel = require("../models/disciplinaryActionModel.js");
// const createDisciplinaryAction = async (data) => {
//   return await disciplinaryActionModel.createDisciplinaryAction(data);
// };

// const getDisciplinaryActionById = async (id) => {
//   return await disciplinaryActionModel.findDisciplinaryActionById(id);
// };

// const updateDisciplinaryAction = async (id, data) => {
//   return await disciplinaryActionModel.updateDisciplinaryAction(id, data);
// };

// const deleteDisciplinaryAction = async (id) => {
//   return await disciplinaryActionModel.deleteDisciplinaryAction(id);
// };

// const getAllDisciplinaryActions = async (page, size, startDate, endDate) => {
//   return await disciplinaryActionModel.getAllDisciplinaryAction(
//     page,
//     size,
//     startDate,
//     endDate
//   );
// };

// module.exports = {
//   createDisciplinaryAction,
//   getDisciplinaryActionById,
//   updateDisciplinaryAction,
//   deleteDisciplinaryAction,
//   getAllDisciplinaryActions,
// };

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

/**
 * @param {object} query
 * @param {string|number} query.page
 * @param {string|number} query.size
 * @param {string} query.search
 * @param {string} query.dateFilter
 * @param {string} query.customStartDate  // DD-MM-YYYY
 * @param {string} query.customEndDate    // DD-MM-YYYY
 * @param {string} query.empName
 * @param {string} query.actionTaken
 * @param {string} query.penalty
 * @param {string} query.status
 */
const getAllDisciplinaryActions = async (query) => {
  const {
    page,
    size,
    search,
    dateFilter,
    customStartDate,
    customEndDate,
    empName,
    actionTaken,
    penalty,
    status,
  } = query;

  return await disciplinaryActionModel.getAllDisciplinaryAction(
    page,
    size,
    search,
    dateFilter,
    customStartDate,
    customEndDate,
    empName,
    actionTaken,
    penalty,
    status
  );
};

module.exports = {
  createDisciplinaryAction,
  getDisciplinaryActionById,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
  getAllDisciplinaryActions,
};
