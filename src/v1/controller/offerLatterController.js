const offerLatterService = require('../services/offerLatterService');
const CustomError = require('../../utils/CustomError');

const createOfferLetter = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            createdby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await offerLatterService.createOfferLetter(data);
        res.status(201).success('Offer letter created successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const findOfferLetterById = async (req, res, next) => {
    try {
        const reqData = await offerLatterService.findOfferLetterById(req.params.id);
        if (!reqData) throw new CustomError('Offer letter not found', 404);
        res.status(200).success(null, reqData);
    } catch (error) {
        next(error);
    }
};

const updateOfferLetter = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            updatedby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await offerLatterService.updateOfferLetter(req.params.id, data);
        res.status(200).success('Offer letter updated successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const deleteOfferLetter = async (req, res, next) => {
    try {
        await offerLatterService.deleteOfferLetter(req.params.id);
        res.status(200).success('Offer letter deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllOfferLetter = async (req, res, next) => {
    try {
            const { page , size ,search ,startDate,endDate  } = req.query;
        const data = await offerLatterService.getAllOfferLetter(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOfferLetter,
    findOfferLetterById,
    updateOfferLetter,
    deleteOfferLetter,
    getAllOfferLetter,
};
