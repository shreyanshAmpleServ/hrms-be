const loanTypeService = require('../services/loanTypeService');
const CustomError = require('../../utils/CustomError');
const moment = require('moment');

const createLoanType = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            createdby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await loanTypeService.createLoanType(data);
        res.status(201).success('Loan type created successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const findLoanTypeById = async (req, res, next) => {
    try {
        const reqData = await loanTypeService.findLoanTypeById(req.params.id);
        if (!reqData) throw new CustomError('Loan type not found', 404);
        res.status(200).success(null, reqData);
    } catch (error) {
        next(error);
    }
};

const updateLoanType = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            updatedby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await loanTypeService.updateLoanType(req.params.id, data);
        res.status(200).success('Loan type updated successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const deleteLoanType = async (req, res, next) => {
    try {
        await loanTypeService.deleteLoanType(req.params.id);
        res.status(200).success('Loan type deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllLoanType = async (req, res, next) => {
    try {
            const { page , size ,search ,startDate,endDate  } = req.query;
        const data = await loanTypeService.getAllLoanType(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLoanType,
    findLoanTypeById,
    updateLoanType,
    deleteLoanType,
    getAllLoanType,
};
