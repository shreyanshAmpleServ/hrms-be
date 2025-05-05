// Currency Model
const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createCurrency = async (data) => {
    try {
        const currency = await prisma.Currency.create({
            data: {
                name: data.name,
                icon: data.icon || null,
                is_default: data.is_default || false,
                code: data.code,
                is_active: data.is_active || 'Y',
                createdby: data.createdby || 1,
                log_inst: data.log_inst || 1,
            },
        });
        return currency;
    } catch (error) {
        throw new CustomError(`Error creating currency: ${error.message}`, 500);
    }
};

const findCurrencyById = async (id) => {
    try {
        const currency = await prisma.Currency.findUnique({
            where: { id: parseInt(id) },
        });
        if (!currency) {
            throw new CustomError('Currency not found', 404);
        }
        return currency;
    } catch (error) {
        throw new CustomError(`Error finding currency by ID: ${error.message}`, 503);
    }
};

const updateCurrency = async (id, data) => {
    try {
        const updatedCurrency = await prisma.Currency.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                updatedate: new Date(),
            },
        });
        return updatedCurrency;
    } catch (error) {
        throw new CustomError(`Error updating currency: ${error.message}`, 500);
    }
};

const deleteCurrency = async (id) => {
    try {
        await prisma.Currency.delete({
            where: { id: parseInt(id) },
        });
    } catch (error) {
        throw new CustomError(`Error deleting currency: ${error.message}`, 500);
    }
};

const getAllCurrency = async () => {
    try {
        const Currency = await prisma.Currency.findMany({
            orderBy: [
                { updatedate: 'desc' },
                { createdate: 'desc' },
            ],
        });
        return Currency;
    } catch (error) {
        throw new CustomError('Error retrieving Currency', 503);
    }
};

module.exports = {
    createCurrency,
    findCurrencyById,
    updateCurrency,
    deleteCurrency,
    getAllCurrency,
};