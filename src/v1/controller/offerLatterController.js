const JobPostingService = require('../services/JobPostingService');
const CustomError = require('../../utils/CustomError');

const createJobPosting = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            createdby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await JobPostingService.createJobPosting(data);
        res.status(201).success('Job posting created successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const findJobPostingById = async (req, res, next) => {
    try {
        const reqData = await JobPostingService.findJobPostingById(req.params.id);
        if (!reqData) throw new CustomError('Job posting not found', 404);
        res.status(200).success(null, reqData);
    } catch (error) {
        next(error);
    }
};

const updateJobPosting = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            updatedby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await JobPostingService.updateJobPosting(req.params.id, data);
        res.status(200).success('Job posting updated successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const deleteJobPosting = async (req, res, next) => {
    try {
        await JobPostingService.deleteJobPosting(req.params.id);
        res.status(200).success('Job posting deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllJobPosting = async (req, res, next) => {
    try {
            const { page , size ,search ,startDate,endDate  } = req.query;
        const data = await JobPostingService.getAllJobPosting(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createJobPosting,
    findJobPostingById,
    updateJobPosting,
    deleteJobPosting,
    getAllJobPosting,
};
