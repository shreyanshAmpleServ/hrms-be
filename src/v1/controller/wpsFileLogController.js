const wpsFileLogService = require('../services/wpsFileLogService');
const CustomError = require('../../utils/CustomError');
const moment = require('moment');
const { uploadToBackblaze, deleteFromBackblaze } = require('../../utils/uploadBackblaze');

const createWPSFile = async (req, res, next) => {
    try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "WPSFile");
    }
        const data = {
            ...req.body,
            createdby: req.user.id,
            file_path: imageUrl,
            log_inst: req.user.log_inst,  }
        const reqData = await wpsFileLogService.createWPSFile(data);
        res.status(201).success('WPS file created successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const findWPSFileById = async (req, res, next) => {
    try {
        const reqData = await wpsFileLogService.findWPSFileById(req.params.id);
        if (!reqData) throw new CustomError('WPS file not found', 404);
        res.status(200).success(null, reqData);
    } catch (error) {
        next(error);
    }
};

const updateWPSFile = async (req, res, next) => {
    try {
        const existingData = await wpsFileLogService.findWPSFileById(req.params.id);
        if (!existingData) throw new CustomError("File not found", 404);
           let imageUrl = existingData.file_path;  
   
           if (req.file) {
      imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "WPSFile");
    }
        const data = {
            ...req.body,
            file_path: req.file ? imageUrl : existingData.file_path,
            updatedby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await wpsFileLogService.updateWPSFile(req.params.id, data);
        res.status(200).success('WPS file updated successfully', reqData);
        if (req.file) {
      if (existingData.image) {
        await deleteFromBackblaze(existingData.image); // Delete the old logo
      }}
    } catch (error) {
        next(error);
    }
};

const deleteWPSFile = async (req, res, next) => {
    try {
        const existingData = await wpsFileLogService.findWPSFileById(req.params.id);
        await wpsFileLogService.deleteWPSFile(req.params.id);
        res.status(200).success('WPS file deleted successfully', null);
            if (existingData.image) {
      await deleteFromBackblaze(existingData.image); // Delete the old logo
    }
    } catch (error) {
        next(error);
    }
};

const getAllWPSFile = async (req, res, next) => {
    try {
            const { page , size ,search ,startDate,endDate  } = req.query;
        const data = await wpsFileLogService.getAllWPSFile(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createWPSFile,
    findWPSFileById,
    updateWPSFile,
    deleteWPSFile,
    getAllWPSFile,
};
