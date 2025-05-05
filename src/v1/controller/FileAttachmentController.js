const AttachmentService = require('../services/FileAttachmentService');
const CustomError = require('../../utils/CustomError');
const { generateFullUrl } = require('../../utils/helper');
const moment = require("moment");
const { uploadToBackblaze } = require('../../utils/uploadBackblaze');
const { findAttachmentById } = require('../models/FileAttachmentModel');

const createAttachment = async (req, res, next) => {
    try {
        let imageUrl =null;
        if (req.file) {
          imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , `documents/${req.body.related_entity_type}`);
        } 
        // const profielPath = req.file ? req.file.path : null; // Construct path
        let userData = { ...req.body,createdby:req.user.id, file: imageUrl }; 
        const attachmentData = await AttachmentService.createAttachment(userData);
        res.status(201).success('File attachment created successfully', attachmentData);
    } catch (error) {
        next(error);
    }
};

const getCallTypeById = async (req, res, next) => {
    try {
        const attachmentData = await AttachmentService.findAttachmentById(req.params.id);
        if (!attachmentData) throw new CustomError('File attachment not found', 404);
        res.status(200).success(null, attachmentData);
    } catch (error) {
        next(error);
    }
};

const updateAttachment = async (req, res, next) => {
    try {
        const existingData = await findAttachmentById(req.params.id);
        const {id , ...data} = req.body
        let imageUrl =req.body.file;
        if (req.file) {
          imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , `documents/${req.body.related_entity_type}`);
        } 
        // const profielPath = req.file ? req.file.path : null; // Construct path
        let userData = { ...data,updatedby:req.user.id, file: imageUrl }; 
        const attachmentData = await AttachmentService.updateAttachment(req.params.id, userData);
        res.status(200).success('File attachment updated successfully', attachmentData);
        if (req.file) {
            if (existingData.file) {
              await deleteFromBackblaze(existingData.file); // Delete the old logo
            }}
    } catch (error) {
        next(error);
    }
};

const deleteAttachment = async (req, res, next) => {
    try {
        const existingData = await findAttachmentById(req.params.id);
        await AttachmentService.deleteAttachment(req.params.id);
        res.status(200).success('File attachment deleted successfully', null);
        if (existingData.file) {
          await deleteFromBackblaze(existingData.file); // Delete the old logo
        }
    } catch (error) {
        next(error);
    }
};

const getAllAttachment = async (req, res, next) => {
    try {   
         const { page , size , search ,startDate,endDate , related_type  } = req.query;
        const attachmentData = await AttachmentService.getAllAttachment(search ,Number(page), Number(size) ,moment(startDate),moment(endDate) ,related_type);
        res.status(200).success('File attachment get successfully', attachmentData);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAttachment,
    getCallTypeById,
    updateAttachment,
    deleteAttachment,
    getAllAttachment,
};
