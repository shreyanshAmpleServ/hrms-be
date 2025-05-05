const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

// Create a new call purpose
const createCallPurpose = async (data) => {
    try {
        const callPurpose = await prisma.crms_m_callpurpose.create({
            data: {
                name: data.name,
                description: data.description || null,
                is_active: data.is_active || 'Y',
                createdby: data.createdby || 1,
                log_inst: data.log_inst || 1,
            },
        });
        return callPurpose;
    } catch (error) {
        throw new CustomError(`Error creating call purpose: ${error.message}`, 500);
    }
};

// Find a call purpose by ID
const findCallPurposeById = async (id) => {
    try {
        const callPurpose = await prisma.crms_m_callpurpose.findUnique({
            where: { id: parseInt(id) },
        });
        if (!callPurpose) {
            throw new CustomError('Call purpose not found', 404);
        }
        return callPurpose;
    } catch (error) {
        throw new CustomError(`Error finding call purpose by ID: ${error.message}`, 503);
    }
};

// Update a call purpose
const updateCallPurpose = async (id, data) => {
    try {
        const updatedCallPurpose = await prisma.crms_m_callpurpose.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                updatedate: new Date(),
            },
        });
        return updatedCallPurpose;
    } catch (error) {
        throw new CustomError(`Error updating call purpose: ${error.message}`, 500);
    }
};

// Delete a call purpose
const deleteCallPurpose = async (id) => {
    try {
        await prisma.crms_m_callpurpose.delete({
            where: { id: parseInt(id) },
        });
    } catch (error) {
        throw new CustomError(`Error deleting call purpose: ${error.message}`, 500);
    }
};

// Get all call purposes
const getAllCallPurposes = async () => {
    try {
        const callPurpose = await prisma.crms_m_callpurpose.findMany({
            orderBy: [
                { updatedate: 'desc' },
                { createdate: 'desc' },
            ],
        });
        return callPurpose;
    } catch (error) {
        throw new CustomError('Error retrieving call purposes', 503);
    }
};

module.exports = {
    createCallPurpose,
    findCallPurposeById,
    updateCallPurpose,
    deleteCallPurpose,
    getAllCallPurposes,
};
