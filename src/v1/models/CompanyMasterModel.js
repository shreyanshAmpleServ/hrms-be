const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

// Create a new company
const createCompany = async (data) => {
    try {
        const company = await prisma.hrms_m_company_master.create({
            data: {
               ...data,
               country_id:Number(data.country_id),
                createdby: data.createdby || 1,
                createdate: new Date(),
                updatedate: new Date(),
                log_inst: data.log_inst || 1,
            },
        });
        return company;
    } catch (error) {
        throw new CustomError(`Error creating company: ${error.message}`, 500);
    }
};

// Find a company by ID
const findCompanyById = async (id) => {
    try {
        const company = await prisma.hrms_m_company_master.findUnique({
            where: { id: parseInt(id) },
        });
        if (!company) {
            throw new CustomError('company not found', 404);
        }
        return company;
    } catch (error) {
        throw new CustomError(`Error finding company by ID: ${error.message}`, 503);
    }
};

// Update a company
const updateCompany = async (id, data) => {
    try {
        const updatedcompany = await prisma.hrms_m_company_master.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                country_id: Number(data.country_id),
                updatedate: new Date(),
            },
        });
        return updatedcompany;
    } catch (error) {
        throw new CustomError(`Error updating company: ${error.message}`, 500);
    }
};

// Delete a company
const deleteCompany = async (id) => {
    try {
        await prisma.hrms_m_company_master.delete({
            where: { id: parseInt(id) },
        });
    } catch (error) {
        throw new CustomError(`Error deleting company: ${error.message}`, 500);
    }
};

// Get all companies
const getAllCompanies = async () => {
    try {
        const companies = await prisma.hrms_m_company_master.findMany({
            orderBy: [
                { updatedate: 'desc' },
                { createdate: 'desc' },
            ],
        });
        return companies;
    } catch (error) {
        throw new CustomError('Error retrieving companies', 503);
    }
};

module.exports = {
    createCompany,
    findCompanyById,
    updateCompany,
    deleteCompany,
    getAllCompanies,
};
