const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

// Create a new state
const createState = async (data) => {
    try {
        const state = await prisma.State.create({
            data: {
                name: data.name,
                description: data.description || null,
                is_active: data.is_active || 'Y',
                createdby: data.createdby || 1,
                log_inst: data.log_inst || 1,
            },
        });
        return state;
    } catch (error) {

        throw new CustomError(`Error creating state: ${error.message}`, 500);
    }
};

// Find a state by ID
const findStateById = async (id) => {
    try {
        const state = await prisma.State.findUnique({
            where: { id: parseInt(id) },
        });
        if (!state) {
            throw new CustomError('State not found', 404);
        }
        return state;
    } catch (error) {
        throw new CustomError(`Error finding state by ID: ${error.message}`, 503);
    }
};

// Update a state
const updateState = async (id, data) => {
    try {
        const updatedState = await prisma.State.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                updatedate: new Date(),
            },
        });
        return updatedState;
    } catch (error) {
        throw new CustomError(`Error updating state: ${error.message}`, 500);
    }
};

// Delete a state
const deleteState = async (id) => {
    try {
        await prisma.State.delete({
            where: { id: parseInt(id) },
        });
    } catch (error) {
        throw new CustomError(`Error deleting state: ${error.message}`, 500);
    }
};

// Get all states
const getAllStates = async ({country_id}) => {
    try {
        const states = await prisma.State.findMany({
            where:{
country_code : Number(country_id)
            },
            orderBy: [
                { updatedate: 'desc' },
                { createdate: 'desc' },
            ],
        });
        return states;
    } catch (error) {
        console.log(error)
        throw new CustomError('Error retrieving states', 503);
    }
};

module.exports = {
    createState,
    findStateById,
    updateState,
    deleteState,
    getAllStates,
};
