const purchaseInvoiceService = require('../services/purchaseInvoiceService');
const CustomError = require('../../utils/CustomError');
const { generateFullUrl } = require('../../utils/helper');
const moment = require("moment");
const { deleteFromBackblaze, uploadToBackblaze } = require('../../utils/uploadBackblaze');
const { findPurchaseInvoiceById } = require('../models/purchaseInvoiceModal');

const createPurchaseInvoice = async (req, res, next) => {
    try {
        const { orderItemsData, ...orderData } = req.body;
        
        const attachment1Path = req.files?.attachment1?.length ?   await uploadToBackblaze(req.files?.attachment1?.[0]?.buffer, req.files?.attachment1?.[0]?.originalname, req.files?.attachment1?.[0]?.mimetype , `purchaseInvoice`) :  null;
        const attachment2Path = req.files?.attachment2?.length ?   await uploadToBackblaze(req.files?.attachment2?.[0]?.buffer, req.files?.attachment2?.[0]?.originalname, req.files?.attachment2?.[0]?.mimetype , `purchaseInvoice`) :  null; 

        const parsedOrderItemsData = orderItemsData ? JSON.parse(orderItemsData) : [];
        const orderDAta =  { ...orderData, 
             attachment1: attachment1Path || null,
            attachment2: attachment2Path || null, createdby: req.user.id }
        const product = await purchaseInvoiceService.createPurchaseInvoice(orderDAta, parsedOrderItemsData);

        // const product = await purchaseInvoiceService.createPurchaseInvoice(orderData , orderItemsData);
        res.status(201).success('Purchase invoice created successfully', product);
    } catch (error) {
        next(error);
    }
};

const getPurchaseInvoiceById = async (req, res, next) => {
    try {
        const product = await purchaseInvoiceService.findPurchaseInvoiceById(req.params.id);
        if (!product) throw new CustomError('order not found', 404);
        res.status(200).success(null, product);
    } catch (error) {
        next(error);
    }
};

const updatePurchaseInvoice = async (req, res, next) => {
    try {
        const existingData = await findPurchaseInvoiceById(req.params.id);
        const { orderItemsData, id, ...orderData } = req.body;
        
        const attachment1Path = req.files?.attachment1?.length ?   await uploadToBackblaze(req.files?.attachment1?.[0]?.buffer, req.files?.attachment1?.[0]?.originalname, req.files?.attachment1?.[0]?.mimetype , `purchaseInvoice`) :  req.body.attachment1;
        const attachment2Path = req.files?.attachment2?.length ?   await uploadToBackblaze(req.files?.attachment2?.[0]?.buffer, req.files?.attachment2?.[0]?.originalname, req.files?.attachment2?.[0]?.mimetype , `purchaseInvoice`) :  req.body.attachment2; 

        const parsedOrderItemsData = orderItemsData ? JSON.parse(orderItemsData) : [];
        const orderDAta =  { ...orderData, 
             attachment1: attachment1Path,
             attachment2: attachment2Path, 
             updatedby: req.user.id }

        const product = await purchaseInvoiceService.updatePurchaseInvoice(id,orderDAta, parsedOrderItemsData);
        res.status(200).success('Purchase invoice updated successfully', product);
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

const deletePurchaseInvoice = async (req, res, next) => {
    try {
        const existingData = await findPurchaseInvoiceById(req.params.id);
        await purchaseInvoiceService.deletePurchaseInvoice(req.params.id);
        res.status(200).success('Purchase invoice deleted successfully', null);
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
const getAllPurchaseInvoice = async (req, res, next) => {
    try {
        const { page , size ,search ,startDate, endDate } = req.query;
        const products = await purchaseInvoiceService.getAllPurchaseInvoice(search,Number(page), Number(size) ,moment(startDate),moment(endDate));
        res.status(200).success(null , products );
        // res.status(200).json({ success: true,   message:"product get successfully" , products });
    } catch (error) {
        next(error);
    }
};
const generatePurchaseInvoiceCode = async (req, res, next) => {
    try {
        const OrderCode = await purchaseInvoiceService.generatePurchaseInvoiceCode();
        res.status(200).success(null , OrderCode );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPurchaseInvoice,
    updatePurchaseInvoice,
    deletePurchaseInvoice,
    getAllPurchaseInvoice,
    getPurchaseInvoiceById,
    generatePurchaseInvoiceCode,
};
