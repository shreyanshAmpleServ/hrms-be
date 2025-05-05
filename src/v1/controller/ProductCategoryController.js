const productCategoryService = require('../services/productCategoryService');
const CustomError = require('../../utils/CustomError');

const createProductCategory = async (req, res, next) => {
    try {
        const category = await productCategoryService.createProductCategory(req.body);
        res.status(201).success('category created successfully', category);
    } catch (error) {
        next(error);
    }
};

const findCategoryById = async (req, res, next) => {
    try {
        const category = await productCategoryService.findCategoryById(req.params.id);
        if (!category) throw new CustomError('category not found', 404);
        res.status(200).success(null, category);
    } catch (error) {
        next(error);
    }
};

const updateProductCategory = async (req, res, next) => {
    try {
        const category = await productCategoryService.updateProductCategory(req.params.id, req.body);
        res.status(200).success('category updated successfully', category);
    } catch (error) {
        next(error);
    }
};

const deleteProductCategory = async (req, res, next) => {
    try {
        await productCategoryService.deleteProductCategory(req.params.id);
        res.status(200).success('category deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllProductCategory = async (req, res, next) => {
    try {
        const categories = await productCategoryService.getAllProductCategory();
        res.status(200).success(null, categories);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProductCategory,
    findCategoryById,
    updateProductCategory,
    deleteProductCategory,
    getAllProductCategory,
};
