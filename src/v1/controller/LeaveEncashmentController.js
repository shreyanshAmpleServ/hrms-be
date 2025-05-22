const LeaveEncashmentService = require('../services/LeaveEncashmentService');
const CustomError = require('../../utils/CustomError');
const moment = require('moment');

const createLeaveEncashment = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            createdby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await LeaveEncashmentService.createLeaveEncashment(data);
        res.status(201).success('Leave encashment created successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const findLeaveEncashmentById = async (req, res, next) => {
    try {
        const reqData = await LeaveEncashmentService.findLeaveEncashmentById(req.params.id);
        if (!reqData) throw new CustomError('Leave encashment not found', 404);
        res.status(200).success(null, reqData);
    } catch (error) {
        next(error);
    }
};

const updateLeaveEncashment = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            updatedby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await LeaveEncashmentService.updateLeaveEncashment(req.params.id, data);
        res.status(200).success('Leave encashment updated successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const deleteLeaveEncashment = async (req, res, next) => {
    try {
        await LeaveEncashmentService.deleteLeaveEncashment(req.params.id);
        res.status(200).success('Leave encashment deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllLeaveEncashment = async (req, res, next) => {
    try {
            const { page , size ,search ,startDate,endDate  } = req.query;
        const data = await LeaveEncashmentService.getAllLeaveEncashment(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLeaveEncashment,
    findLeaveEncashmentById,
    updateLeaveEncashment,
    deleteLeaveEncashment,
    getAllLeaveEncashment,
};
