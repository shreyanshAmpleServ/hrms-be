const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

// Create a new source
const createSource = async (data) => {
  try {
      const source = await prisma.Sources.create({
      data: {
        name: data.name,
        description: data.description || null,
        is_active: data.is_active || 'Y',
        createdby: data.createdby||1,
        log_inst: data.log_inst || 1,
      },
    });
    return source;
  } catch (error) {
    throw new CustomError(`Error creating source: ${error.message}`, 500);
  }
};

// Find a source by ID
const findSourceById = async (id) => {
  try {
    const source = await prisma.Sources.findUnique({
      where: { id: parseInt(id) },
    });
    if (!source) {
      throw new CustomError('Source not found', 404);
    }
    return source;
  } catch (error) {
    throw new CustomError(`Error finding source by ID: ${error.message}`, 503);
  }
};

// Update a source
const updateSource = async (id, data) => {
  try {
    const updatedSource = await prisma.Sources.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedSource;
  } catch (error) {
    throw new CustomError(`Error updating source: ${error.message}`, 500);
  }
};

// Delete a source
const deleteSource = async (id) => {
  try {
    await prisma.Sources.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting source: ${error.message}`, 500);
  }
};

// Get all sources
const getAllSources = async () => {
  try {
    const sources = await prisma.Sources.findMany({
      orderBy: [
        { updatedate: 'desc' },
        { createdate: 'desc' },
      ],
    });
    return sources;
  } catch (error) {
    throw new CustomError('Error retrieving sources', 503);
  }
};

module.exports = {
  createSource,
  findSourceById,
  updateSource,
  deleteSource,
  getAllSources,
};
