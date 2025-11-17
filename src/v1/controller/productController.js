const productService = require('../services/productService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment");
const { uploadToBackblaze, deleteFromBackblaze } = require('../../utils/uploadBackblaze');
const productModel = require('../models/productModal');
const { getPrisma } = require("../../config/prismaContext.js");

const createProduct = async (req, res, next) => {
    try {
        let imageUrl = null;
        if (req.file) {
          imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "product");
        }
        let userData = { ...req.body,createdby:req.user.id, product_image: imageUrl }; 

        // const user = await vendorService.createVendor(userData);
        const product = await productService.createProduct(userData);
        res.status(201).success('product created successfully', product);
    } catch (error) {
        next(error);
    }
};

const findProductById = async (req, res, next) => {
    try {
        const product = await productService.findProductById(req.params.id);
        if (!product) throw new CustomError('product not found', 404);
        res.status(200).success(null, product);
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const existingData = await productModel.findProductById(req.params.id);
        const productData = {...req.body,updatedby:req.user.id}
        // Update profile_img only if a new image is provided
        productData.product_image = req.body.product_image;
        if (req.file) {
            productData.product_image = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "product") || null;
        }
        const product = await productService.updateProduct(req.params.id,productData);
        res.status(200).success('product updated successfully', product);
        if (req.file) {
          if (existingData.product_image) {
            await deleteFromBackblaze(existingData.product_image); // Delete the old logo
          }}
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const existingData = await productModel.findProductById(req.params.id);
        await productService.deleteProduct(req.params.id);
        res.status(200).success('product deleted successfully', null);
          if (existingData.product_image) {
            await deleteFromBackblaze(existingData.product_image); // Delete the old logo
          }
    } catch (error) {
        next(error);
    }
};

const getAllProduct = async (req, res, next) => {
    try {
        const { page , size ,search ,startDate,endDate  } = req.query;
        const products = await productService.getAllProduct(search,Number(page), Number(size),moment(startDate),moment(endDate));
        res.status(200).success(null , products );
        // res.status(200).json({ success: true,   message:"product get successfully" , products });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    findProductById,
    updateProduct,
    deleteProduct,
    getAllProduct,
};
