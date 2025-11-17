const CustomError = require('../../utils/CustomError');
const { getPrisma } = require("../../config/prismaContext.js");

// Create a new user
const createUser = async (data) => {
   const prisma = getPrisma();
   try {
       const prisma = getPrisma();
        const user = await prisma.crms_m_user.create({
            data: {
                ...data,
                is_active: data.is_active || 'Y', // Default to active
                log_inst: data.log_inst || 1,
                createdate: new Date(),
                createdby: data.createdby || 1,
            },
        });
        return user;
    } catch (error) {
      console.log(error);
        throw new CustomError(`Error creating user: ${error.message}`, 500);
    }
};

// Find a user by email
const findUserByEmail = async (email) => {
    const prisma = getPrisma();
    try {
        const prisma = getPrisma();
        const user = await prisma.crms_m_user.findFirst({
            where: { email },
            select: {
                id: true,
                username: true,
                email: true,
                password: true,
                full_name: true,
                phone: true,
                address: true,
                profile_img: true,
                is_active: true,
                createdate: true,
                updatedate: true,
            },
        });
        if (!user) {
            throw new CustomError('User not found', 404);
        }
        return user;
    } catch (error) {
        throw new CustomError(`Error finding user by email: ${error.message}`, 503);
    }
};

// Find a user by ID
const findUserById = async (id) => {
    const prisma = getPrisma();
    try {
        const prisma = getPrisma();
        const user = await prisma.crms_m_user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                phone: true,
                address: true,
                profile_img: true,
                is_active: true,
                createdate: true,
                updatedate: true,
            },
        });
        if (!user) {
            throw new CustomError('User not found', 404);
        }
        return user;
    } catch (error) {
        throw new CustomError(`Error finding user by ID: ${error.message}`, 503);
    }
};

// Update a user
const updateUser = async (id, data) => {
    const prisma = getPrisma();
    try {
        const prisma = getPrisma();
        const updatedUser = await prisma.crms_m_user.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                updatedate: new Date(),
            },
        });
        return updatedUser;
    } catch (error) {
        throw new CustomError(`Error updating user: ${error.message}`, 500);
    }
};

// Delete a user
const deleteUser = async (id) => {
    const prisma = getPrisma();
    try {
        const prisma = getPrisma();
        await prisma.crms_m_user.delete({
            where: { id: parseInt(id) },
        });
    } catch (error) {
        throw new CustomError(`Error deleting user: ${error.message}`, 500);
    }
};

// Get all users
const getAllUsers = async () => {
    const prisma = getPrisma();
    try {
        const prisma = getPrisma();
        const users = await prisma.crms_m_user.findMany({
            orderBy: [
                { updatedate: 'desc' },
                { createdate: 'desc' },
            ],
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                phone: true,
                address: true,
                profile_img: true,
                is_active: true,
                createdate: true,
                updatedate: true,
            },
        });
        return users;
    } catch (error) {
        throw new CustomError('Error retrieving users', 503);
    }
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    deleteUser,
    getAllUsers,
};
