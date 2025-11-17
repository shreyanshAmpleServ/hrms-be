const quotaionService = require('../services/quotaionService');
const CustomError = require('../../utils/CustomError');
const { generateFullUrl } = require('../../utils/helper');
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");
const { uploadToBackblaze } = require('../../utils/uploadBackblaze');
const { deleteFromBackblaze } = require('../../utils/uploadBackblaze');
const { findQuotationById } = require('../models/quotationModal');


const createQuotation = async (req, res, next) => {
    try {
        const { orderItemsData, ...orderData } = req.body;

        const attachment1Path = req.files?.attachment1?.length ?   await uploadToBackblaze(req.files?.attachment1?.[0]?.buffer, req.files?.attachment1?.[0]?.originalname, req.files?.attachment1?.[0]?.mimetype , `Quotations`) : null;
        const attachment2Path = req.files?.attachment2?.length ?   await uploadToBackblaze(req.files?.attachment2?.[0]?.buffer, req.files?.attachment2?.[0]?.originalname, req.files?.attachment2?.[0]?.mimetype , `Quotations`) : null; 

        const parsedOrderItemsData = orderItemsData ? JSON.parse(orderItemsData) : [];
        const orderDAta =  { ...orderData, 
             attachment1: attachment1Path || null,
            attachment2: attachment2Path || null,
             createdby: req.user.id }
        const product = await quotaionService.createQuotation(orderDAta, parsedOrderItemsData);

        // const product = await quotaionService.createQuotation(orderData , orderItemsData);
        res.status(201).success('Quotation created successfully', product);
    } catch (error) {
        next(error);
    }
};

const getQuotationById = async (req, res, next) => {
    try {
        const product = await quotaionService.findQuotationById(req.params.id);
        if (!product) throw new CustomError('order not found', 404);
        res.status(200).success(null, product);
    } catch (error) {
        next(error);
    }
};

const updateQuotaion = async (req, res, next) => {
    try {
        const existingData = await findQuotationById(req.params.id);
        const { orderItemsData, id, ...orderData } = req.body;
        const attachment1Path = req.files?.attachment1?.length ?  await uploadToBackblaze(req.files?.attachment1?.[0]?.buffer, req.files?.attachment1?.[0]?.originalname, req.files?.attachment1?.[0]?.mimetype , `Quotations`) : req.body.attachment1;
        const attachment2Path = req.files?.attachment2?.length ?  await uploadToBackblaze(req.files?.attachment2?.[0]?.buffer, req.files?.attachment2?.[0]?.originalname, req.files?.attachment2?.[0]?.mimetype , `Quotations`) : req.body.attachment2; 
       
        // let orderData = { ...req.body.orderData,updatedby:req.user.id}; 
        // let orderItemsData = JSON.parse(req.body.orderItemsData)
        const parsedOrderItemsData = orderItemsData ? JSON.parse(orderItemsData) : [];
        const orderDAta =  { ...orderData,  
            attachment1: attachment1Path ,
            attachment2: attachment2Path , 
            updatedby: req.user.id }

        const product = await quotaionService.updateQuotaion(id,orderDAta, parsedOrderItemsData);

        // const product = await quotaionService.updateQuotaion(req.params.id,orderData,orderItemsData);
        res.status(200).success('Quotation updated successfully', product);
        if (req.files) {
            if (existingData.attachment1) {
              await deleteFromBackblaze(existingData.attachment1); // Delete the old logo
            }
            if (existingData.attachment2) {
              await deleteFromBackblaze(existingData.attachment2); // Delete the old logo
            }
        }
    } catch (error) {
        next(error);
    }
};

const deleteQuotation = async (req, res, next) => {
    try {
        const existingData = await findQuotationById(req.params.id);

        await quotaionService.deleteQuotation(req.params.id);
        res.status(200).success('Quotation deleted successfully', null);
        if (existingData.attachment1) {
            await deleteFromBackblaze(existingData.attachment1); // Delete the old logo
          }
          if (existingData.attachment2) {
            await deleteFromBackblaze(existingData.attachment2); // Delete the old logo
          }
    } catch (error) {
        next(error);
    }
};

const getAllQuotaion = async (req, res, next) => {
    try {
        const { page , size , search ,startDate, endDate} = req.query;
        const products = await quotaionService.getAllQuotaion(search,Number(page), Number(size) ,moment(startDate),moment(endDate));
        res.status(200).success(null , products );
        // res.status(200).json({ success: true,   message:"product get successfully" , products });
    } catch (error) {
        next(error);
    }
};
const generateQuotaionCode = async (req, res, next) => {
    try {
        const OrderCode = await quotaionService.generateQuotaionCode();
        res.status(200).success(null , OrderCode );
    } catch (error) {
        next(error);
    }
};

module.exports = {
  createQuotation,
  getQuotationById,
  updateQuotaion,
  deleteQuotation,
  getAllQuotaion,
  generateQuotaionCode
};
