const activitiesService = require('../services/activitesService');
const CustomError = require('../../utils/CustomError');

const createActivitiesStatus = async (req, res, next) => {
    try {

        const activitiesStatus = await activitiesService.createActivitiesStatus(req.body);
        res.status(201).success('Activities  created successfully', activitiesStatus);
    } catch (error) {
        next(error);
    }
};
const getActivitiesTypes = async (req, res, next) => {
    try {
        const activitiesType = await activitiesService.getActivitiesType();
        res.status(200).success(null, activitiesType);
    } catch (error) {
        next(error);
    }
};
const getAllActivitiesStatuses = async (req, res, next) => {
    try {
        const activitiesStatuses = await activitiesService.getAllActivitiesStatuses(req.query);
        res.status(200).success(null, activitiesStatuses);
    } catch (error) {
        next(error);
    }
};
const getGroupActivities = async (req, res, next) => {
    try {
        const activitiesStatuses = await activitiesService.getGroupActivities(req.query);
        res.status(200).success(null, activitiesStatuses);
    } catch (error) {
        next(error);
    }
};
const updateActivities = async (req, res, next) => {
    try {
        const activities = await activitiesService.updateActivities(req.params.id, req.body);
        res.status(200).success('Activity updated successfully', activities);
    } catch (error) {
        next(error);
    }
};
const deleteActivities = async (req, res, next) => {
    try {
        await activitiesService.deleteActivities(req.params.id);
        res.status(200).success('Activities deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllActivitiesStatuses,
    createActivitiesStatus,
    deleteActivities,
    getActivitiesTypes,
    updateActivities,
    getGroupActivities
};
