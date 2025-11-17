const purchaseOrderService = require('../services/purchaseOrderService');
const CustomError = require('../../utils/CustomError');
const { generateFullUrl } = require('../../utils/helper');
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");
const { uploadToBackblaze, deleteFromBackblaze } = require('../../utils/uploadBackblaze');
const { findPurchaseOrderById } = require('../models/purchaseOrderModal');

const createPurchaseOrder = async (req, res, next) => {
    try {
        const { orderItemsData, ...orderData } = req.body;
        
        const attachment1Path = req.files?.attachment1?.length ?   await uploadToBackblaze(req.files?.attachment1?.[0]?.buffer, req.files?.attachment1?.[0]?.originalname, req.files?.attachment1?.[0]?.mimetype , `purchaseOrder`) : null;
        const attachment2Path = req.files?.attachment2?.length ?   await uploadToBackblaze(req.files?.attachment2?.[0]?.buffer, req.files?.attachment2?.[0]?.originalname, req.files?.attachment2?.[0]?.mimetype , `purchaseOrder`) : null; 
  
        const parsedOrderItemsData = orderItemsData ? JSON.parse(orderItemsData) : [];
        const orderDAta =  { ...orderData, 
             attachment1: attachment1Path || null,
            attachment2: attachment2Path || null, 
            createdby: req.user.id }
        const product = await purchaseOrderService.createPurchaseOrder(orderDAta, parsedOrderItemsData);
        res.status(201).success('Order created successfully', product);
    } catch (error) {
        next(error);
    }
};

const getPurchaseOrderById = async (req, res, next) => {
    try {
        const product = await purchaseOrderService.findPurchaseOrderById(req.params.id);
        if (!product) throw new CustomError('order not found', 404);
        res.status(200).success(null, product);
    } catch (error) {
        next(error);
    }
};

const updatePurchaseOrder = async (req, res, next) => {
    try {
        const existingData = await findPurchaseOrderById(req.params.id);
        const { orderItemsData, id, ...orderData } = req.body;
        
        const attachment1Path = req.files?.attachment1?.length ?   await uploadToBackblaze(req.files?.attachment1?.[0]?.buffer, req.files?.attachment1?.[0]?.originalname, req.files?.attachment1?.[0]?.mimetype , `purchaseOrder`) :  req.body.attachment1;
        const attachment2Path = req.files?.attachment2?.length ?   await uploadToBackblaze(req.files?.attachment2?.[0]?.buffer, req.files?.attachment2?.[0]?.originalname, req.files?.attachment2?.[0]?.mimetype , `purchaseOrder`) :  req.body.attachment2; 

        const parsedOrderItemsData = orderItemsData ? JSON.parse(orderItemsData) : [];
        const orderDAta =  { ...orderData,  
            attachment1: attachment1Path ,
            attachment2: attachment2Path ,
            updatedby: req.user.id }

        const product = await purchaseOrderService.updatePurchaseOrder(id,orderDAta, parsedOrderItemsData);
        res.status(200).success('Order updated successfully', product);
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

const deletePurchaseOrder = async (req, res, next) => {
    try {
        const existingData = await findPurchaseOrderById(req.params.id);
        await purchaseOrderService.deletePurchaseOrder(req.params.id);
        res.status(200).success('product deleted successfully', null);
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
const getAllPurchaseOrder = async (req, res, next) => {
    try {
        const { page , size  ,search ,startDate, endDate} = req.query;
        const products = await purchaseOrderService.getAllPurchaseOrder(search,Number(page), Number(size) ,moment(startDate),moment(endDate));
        res.status(200).success(null , products );
        // res.status(200).json({ success: true,   message:"product get successfully" , products });
    } catch (error) {
        next(error);
    }
};
const generatePurchaseOrderCode = async (req, res, next) => {
    try {
        const OrderCode = await purchaseOrderService.generatePurchaseOrderCode();
        res.status(200).success(null , OrderCode );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getAllPurchaseOrder,
    getPurchaseOrderById,
    generatePurchaseOrderCode
};
