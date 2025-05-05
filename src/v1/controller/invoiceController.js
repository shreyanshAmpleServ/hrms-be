const invoiceService = require('../services/invoiceService');
const CustomError = require('../../utils/CustomError');
const { generateFullUrl } = require('../../utils/helper');
const moment = require("moment");
const { deleteFromBackblaze, uploadToBackblaze } = require('../../utils/uploadBackblaze');
const { findInvoiceById } = require('../models/invoiceModal');

const createInvoice = async (req, res, next) => {
    try {
        const { orderItemsData, ...orderData } = req.body;
        
        const attachment1Path = req.files?.attachment1?.length ?   await uploadToBackblaze(req.files?.attachment1?.[0]?.buffer, req.files?.attachment1?.[0]?.originalname, req.files?.attachment1?.[0]?.mimetype , `salesInvoice`) : null;
        const attachment2Path = req.files?.attachment2?.length ?   await uploadToBackblaze(req.files?.attachment2?.[0]?.buffer, req.files?.attachment2?.[0]?.originalname, req.files?.attachment2?.[0]?.mimetype , `salesInvoice`) : null; 

        const parsedOrderItemsData = orderItemsData ? JSON.parse(orderItemsData) : [];
        const orderDAta =  { ...orderData, 
             attachment1: attachment1Path || null,
             attachment2: attachment2Path || null, 
             createdby: req.user.id }
        const product = await invoiceService.createInvoice(orderDAta, parsedOrderItemsData);
        res.status(201).success('Invoice created successfully', product);
    } catch (error) {
        next(error);
    }
};

const getInvoiceById = async (req, res, next) => {
    try {
        const product = await invoiceService.findInvoiceById(req.params.id);
        if (!product) throw new CustomError('order not found', 404);
        res.status(200).success(null, product);
    } catch (error) {
        next(error);
    }
};

const updateInvoice = async (req, res, next) => {
    try {
        const { orderItemsData, id, ...orderData } = req.body;
        const existingData = await findInvoiceById(req.params.id);
        
        const attachment1Path = req.files?.attachment1?.length ?   await uploadToBackblaze(req.files?.attachment1?.[0]?.buffer, req.files?.attachment1?.[0]?.originalname, req.files?.attachment1?.[0]?.mimetype , `salesInvoice`) :  req.body.attachment1;
        const attachment2Path = req.files?.attachment2?.length ?   await uploadToBackblaze(req.files?.attachment2?.[0]?.buffer, req.files?.attachment2?.[0]?.originalname, req.files?.attachment2?.[0]?.mimetype , `salesInvoice`) :  req.body.attachment2; 

        // let orderData = { ...req.body.orderData,updatedby:req.user.id}; 
        // let orderItemsData = JSON.parse(req.body.orderItemsData)
        const parsedOrderItemsData = orderItemsData ? JSON.parse(orderItemsData) : [];
        const orderDAta =  { ...orderData, 
             attachment1: attachment1Path,
             attachment2: attachment2Path, 
             updatedby: req.user.id }

        const product = await invoiceService.updateInvoice(id,orderDAta, parsedOrderItemsData);
        res.status(200).success('Invoice updated successfully', product);
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

const deleteInvoice = async (req, res, next) => {
    try {
        const existingData = await findInvoiceById(req.params.id);
        await invoiceService.deleteInvoice(req.params.id);
        res.status(200).success('Sales invoice deleted successfully', null);
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
const getAllInvoice = async (req, res, next) => {
    try {
        const { page , size , search  ,startDate, endDate } = req.query;
        const products = await invoiceService.getAllInvoice(search ,Number(page), Number(size) ,moment(startDate),moment(endDate));
        res.status(200).success(null , products );
        // res.status(200).json({ success: true,   message:"product get successfully" , products });
    } catch (error) {
        next(error);
    }
};
const generateInvoiceCode = async (req, res, next) => {
    try {
        const OrderCode = await invoiceService.generateInvoiceCode();
        res.status(200).success(null , OrderCode );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getAllInvoice,
    generateInvoiceCode,
    getInvoiceById
};
