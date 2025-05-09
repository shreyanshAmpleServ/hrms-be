const HolidayCalenderService = require('../services/HolidayCalenderService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment")


const createHoliday = async (req, res, next) => {
    try {
        let reqData = { ...req.body };
        const data = await HolidayCalenderService.createHoliday(reqData);
        res.status(201).success('Holiday created successfully', data);
    } catch (error) {
        next(error);
    }
};

const findHolidayById = async (req, res, next) => {
    try {
        const data = await HolidayCalenderService.findHolidayById(req.params.id);
        if (!data) throw new CustomError('Holiday not found', 404);

        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

const updateHoliday = async (req, res, next) => {
    try {
        let reqData = { ...req.body };

        const data = await HolidayCalenderService.updateHoliday(req.params.id, reqData);
        res.status(200).success('Holiday updated successfully', data);
    } catch (error) {
        next(error);
    }
};

const deleteHoliday = async (req, res, next) => {
    try {
        await HolidayCalenderService.deleteHoliday(req.params.id);
        res.status(200).success('Holiday deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllHoliday = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const data = await HolidayCalenderService.getAllHoliday(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createHoliday,
    findHolidayById,
    updateHoliday,
    deleteHoliday,
    getAllHoliday,
};
