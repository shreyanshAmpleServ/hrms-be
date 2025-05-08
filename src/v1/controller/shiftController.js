const shiftService = require('../services/shiftService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment")


const createShift = async (req, res, next) => {
    try {
        let reqData = { ...req.body };
        const data = await shiftService.createShift(reqData);
        res.status(201).success('Shift created successfully', data);
    } catch (error) {
        next(error);
    }
};

const findShiftById = async (req, res, next) => {
    try {
        const data = await shiftService.findShiftById(req.params.id);
        if (!data) throw new CustomError('Shift not found', 404);

        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

const updateShift = async (req, res, next) => {
    try {
        let reqData = { ...req.body };

        const data = await shiftService.updateShift(req.params.id, reqData);
        res.status(200).success('Shift updated successfully', data);
    } catch (error) {
        next(error);
    }
};

const deleteShift = async (req, res, next) => {
    try {
        await shiftService.deleteShift(req.params.id);
        res.status(200).success('Shift deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllShift = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const data = await shiftService.getAllShift(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createShift,
    findShiftById,
    updateShift,
    deleteShift,
    getAllShift,
};
