const EmploymentContractService = require('../services/EmploymentContractService');
const CustomError = require('../../utils/CustomError');
const moment = require('moment');
const { uploadToBackblaze, deleteFromBackblaze } = require('../../utils/uploadBackblaze');

const createEmploymentContract = async (req, res, next) => {
    try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "EmploymentContract");
    }
        const data = {
            ...req.body,
            createdby: req.user.id,
            document_path: imageUrl,
            log_inst: req.user.log_inst,  }
        const reqData = await EmploymentContractService.createEmploymentContract(data);
        res.status(201).success('Employment contract created successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const findEmploymentContractById = async (req, res, next) => {
    try {
        const reqData = await EmploymentContractService.findEmploymentContractById(req.params.id);
        if (!reqData) throw new CustomError('Employment contract not found', 404);
        res.status(200).success(null, reqData);
    } catch (error) {
        next(error);
    }
};

const updateEmploymentContract = async (req, res, next) => {
    try {
        const existingData = await EmploymentContractService.findEmploymentContractById(req.params.id);
        if (!existingData) throw new CustomError("Resume not found", 404);
           let imageUrl = existingData.resume_path;  
   
           if (req.file) {
      imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "EmploymentContract");
    }
        const data = {
            ...req.body,
            document_path: req.file ? imageUrl : existingData.document_path,
            updatedby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await EmploymentContractService.updateEmploymentContract(req.params.id, data);
        res.status(200).success('Employment contract updated successfully', reqData);
        if (req.file) {
      if (existingData.image) {
        await deleteFromBackblaze(existingData.image); // Delete the old logo
      }}
    } catch (error) {
        next(error);
    }
};

const deleteEmploymentContract = async (req, res, next) => {
    try {
        const existingData = await EmploymentContractService.findEmploymentContractById(req.params.id);
        await EmploymentContractService.deleteEmploymentContract(req.params.id);
        res.status(200).success('Employment contract deleted successfully', null);
            if (existingData.image) {
      await deleteFromBackblaze(existingData.image); // Delete the old logo
    }
    } catch (error) {
        next(error);
    }
};

const getAllEmploymentContract = async (req, res, next) => {
    try {
            const { page , size ,search ,startDate,endDate  } = req.query;
        const data = await EmploymentContractService.getAllEmploymentContract(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEmploymentContract,
    findEmploymentContractById,
    updateEmploymentContract,
    deleteEmploymentContract,
    getAllEmploymentContract,
};
