const activitesStatusesModel = require('../models/activitiesModal');

const createActivitiesStatus = async (data) => {
    return await activitesStatusesModel.createActivities(data);
};

const getAllActivitiesStatuses = async (reqBody) => {
    return await activitesStatusesModel.getAllActivities(reqBody);
};
const getGroupActivities = async (reqBody) => {
    return await activitesStatusesModel.getGroupActivities(reqBody);
};
const deleteActivities = async (id) => {
    return await activitesStatusesModel.deleteActivities(id);
};
const updateActivities = async (id, body) => {
    return await activitesStatusesModel.updateActivities(id, body);
};
const getActivitiesType = async () => {
    return await activitesStatusesModel.getActivityType();
};

module.exports = {
    createActivitiesStatus,
    getAllActivitiesStatuses,
    deleteActivities,
    getActivitiesType,
    updateActivities,
    getGroupActivities
};
