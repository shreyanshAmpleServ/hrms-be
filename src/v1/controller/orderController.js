const orderService = require('../services/orderService');
const CustomError = require('../../utils/CustomError');
const { generateFullUrl } = require('../../utils/helper');
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");
const { uploadToBackblaze, deleteFromBackblaze } = require('../../utils/uploadBackblaze');
const { findOrderById } = require('../models/orderModal');

const createOrder = async (req, res, next) => {
    try {
        const { orderItemsData, ...orderData } = req.body;
        
        const attachment1Path = req.files?.attachment1?.length ?   await uploadToBackblaze(req.files?.attachment1?.[0]?.buffer, req.files?.attachment1?.[0]?.originalname, req.files?.attachment1?.[0]?.mimetype , `Orders`) : null;
        const attachment2Path = req.files?.attachment2?.length ?   await uploadToBackblaze(req.files?.attachment2?.[0]?.buffer, req.files?.attachment2?.[0]?.originalname, req.files?.attachment2?.[0]?.mimetype , `Orders`) : null; 
        
        const parsedOrderItemsData = orderItemsData ? JSON.parse(orderItemsData) : [];
        const orderDAta =  { ...orderData, 
             attachment1: attachment1Path || null,
             attachment2: attachment2Path || null, 
             createdby: req.user.id }
        const product = await orderService.createOrder(orderDAta, parsedOrderItemsData);
        res.status(201).success('Order created successfully', product);
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const product = await orderService.findOrderById(req.params.id);
        if (!product) throw new CustomError('order not found', 404);
        res.status(200).success(null, product);
    } catch (error) {
        next(error);
    }
};

const updateOrder = async (req, res, next) => {
    try {
        const { orderItemsData, id, ...orderData } = req.body;
        const existingData = await findOrderById(req.params.id);

        const attachment1Path = req.files?.attachment1?.length ?   await uploadToBackblaze(req.files?.attachment1?.[0]?.buffer, req.files?.attachment1?.[0]?.originalname, req.files?.attachment1?.[0]?.mimetype , `Orders`) :  req.body.attachment1;
        const attachment2Path = req.files?.attachment2?.length ?   await uploadToBackblaze(req.files?.attachment2?.[0]?.buffer, req.files?.attachment2?.[0]?.originalname, req.files?.attachment2?.[0]?.mimetype , `Orders`) :  req.body.attachment2; 

        const parsedOrderItemsData = orderItemsData ? JSON.parse(orderItemsData) : [];
        const orderDAta =  { ...orderData,  
            attachment1: attachment1Path,
            attachment2: attachment2Path, 
            updatedby: req.user.id }

        const product = await orderService.updateOrder(id,orderDAta, parsedOrderItemsData);
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

const deleteOrder = async (req, res, next) => {
    try {
        const { orderItemsData, id, ...orderData } = req.body;
        await orderService.deleteOrder(req.params.id);
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

const getAllOrder = async (req, res, next) => {
    try {
        const { page , size , search  ,startDate, endDate } = req.query;
        const products = await orderService.getAllOrder(search ,Number(page), Number(size) ,moment(startDate),moment(endDate));
        res.status(200).success(null , products );
        // res.status(200).json({ success: true,   message:"product get successfully" , products });
    } catch (error) {
        next(error);
    }
};
const getSalesType = async (req, res, next) => {
    try {
        const saleTypes = await orderService.getSalesType();
        res.status(200).success(null , saleTypes );
        // res.status(200).json({ success: true,   message:"product get successfully" , products });
    } catch (error) {
        next(error);
    }
};
const generateOrderCode = async (req, res, next) => {
    try {
        const OrderCode = await orderService.generateOrderCode();
        res.status(200).success(null , OrderCode );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    getAllOrder,
    getSalesType,
    generateOrderCode,
};
