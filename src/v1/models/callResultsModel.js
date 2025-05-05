const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

// Create a new call result
const createCallResult = async (data) => {
    try {
        const callResult = await prisma.crms_m_callresult.create({
            data: {
                name: data.name,
                description: data.description || null,
                is_active: data.is_active || 'Y',
                createdby: data.createdby || 1,
                log_inst: data.log_inst || 1,
            },
        });
        return callResult;
    } catch (error) {
        throw new CustomError(`Error creating call result: ${error.message}`, 500);
    }
};

// Find a call result by ID
const findCallResultById = async (id) => {
    try {
        const callResult = await prisma.crms_m_callresult.findUnique({
            where: { id: parseInt(id) },
        });
        if (!callResult) {
            throw new CustomError('Call result not found', 404);
        }
        return callResult;
    } catch (error) {
        throw new CustomError(`Error finding call result by ID: ${error.message}`, 503);
    }
};

// Update a call result
const updateCallResult = async (id, data) => {
    try {
        const updatedCallResult = await prisma.crms_m_callresult.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                updatedate: new Date(),
            },
        });
        return updatedCallResult;
    } catch (error) {
        throw new CustomError(`Error updating call result: ${error.message}`, 500);
    }
};

// Delete a call result
const deleteCallResult = async (id) => {
    try {
        await prisma.crms_m_callresult.delete({
            where: { id: parseInt(id) },
        });
    } catch (error) {
        throw new CustomError(`Error deleting call result: ${error.message}`, 500);
    }
};

// Get all call results
const getAllCallResults = async () => {
    try {
        const callStatuses = await prisma.crms_m_callresult.findMany({
            orderBy: [
                { updatedate: 'desc' },
                { createdate: 'desc' },
            ],
        });
        return callStatuses;
    } catch (error) {
        throw new CustomError('Error retrieving call results', 503);
    }
};

module.exports = {
    createCallResult,
    findCallResultById,
    updateCallResult,
    deleteCallResult,
    getAllCallResults,
};
