const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

// Create a new project
const createProject = async (data) => {
    try {
        const project = await prisma.Project.create({
            data: {
                ...data,
                is_active: data.is_active || 'Y',
                createdBy: data.createdBy || 1,
                log_inst: data.log_inst || 1
            },
        });
        return project;
    } catch (error) {
        throw new CustomError(`Error creating project: ${error.message}`, 500);
    }
};

// Find a project by ID
const findProjectById = async (id) => {
    try {
        const project = await prisma.Project.findUnique({
            where: { id: parseInt(id) },
        });
        if (!project) {
            throw new CustomError('Project not found', 404);
        }
        return project;
    } catch (error) {
        throw new CustomError(`Error finding project by ID: ${error.message}`, 503);
    }
};

// Update a project
const updateProject = async (id, data) => {
    console.log('id, data', id, data);
    try {
        const updatedProject = await prisma.Project.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                updatedDate: new Date(),
                is_active: data.is_active || 'Y',
                createdBy: data.createdBy || 1,
                log_inst: data.log_inst || 1
            },
        });
        return updatedProject;
    } catch (error) {
        throw new CustomError(`Error updating project: ${error.message}`, 500);
    }
};

// Delete a project
const deleteProject = async (id) => {
    try {
        await prisma.Project.delete({
            where: { id: parseInt(id) },
        });
    } catch (error) {
        throw new CustomError(`Error deleting project: ${error.message}`, 500);
    }
};

// Get all projects
const getAllProjects = async (search ,page , size ,startDate, endDate) => {
    try {
        page = page || 1 ;
        size = size || 10;
        const skip = (page - 1) * size;
    
        const filters = {};
        // Handle search
        if (search) {
          filters.OR = [
            {
              name: { contains: search.toLowerCase() },
            },
          ];
        }
        // Handle date filtering
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
    
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            filters.createdDate = {
              gte: start,
              lte: end,
            };
          }
        }
        const projects = await prisma.Project.findMany({
            where: filters,
            skip,
            take: size,
            orderBy: [
                { updatedDate: 'desc' },
                { createdDate: 'desc' },
            ],
        });

        const totalCount = await prisma.Project.count();

        return {
            data: projects,
            currentPage: page,
            size,
            totalPages: Math.ceil(totalCount / size),
            totalCount : totalCount  ,
          };
    } catch (error) {
        console.log(error);
        throw new CustomError('Error retrieving projects', 503);
    }
};

module.exports = {
    createProject,
    findProjectById,
    updateProject,
    deleteProject,
    getAllProjects,
};
