const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

// Create a new branch
const createBranch = async (data) => {
    try {
        const branch = await prisma.hrms_m_branch_master.create({
            data: {
                 company_id: Number(data.company_id) ,
                 branch_name: data.branch_name || "",
                 location: data.location || "",
                is_active: data.is_active || 'Y',
                createdby: data.createdby || 1,
                createdate : new Date(),
                log_inst: data.log_inst || 1,
            },
        });
        return branch;
    } catch (error) {

        throw new CustomError(`Error creating branch: ${error.message}`, 500);
    }
};

// Find a branch by ID
const findBranchById = async (id) => {
    try {
        const branch = await prisma.hrms_m_branch_master.findUnique({
            where: { id: parseInt(id) },
        });
        if (!branch) {
            throw new CustomError('branch not found', 404);
        }
        return branch;
    } catch (error) {
        throw new CustomError(`Error finding branch by ID: ${error.message}`, 503);
    }
};

// Update a branch
const updateBranch = async (id, data) => {
    try {
        const updatedbranch = await prisma.hrms_m_branch_master.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                company_id: Number(data.company_id) ,
                updatedate: new Date(),
            },
        });
        return updatedbranch;
    } catch (error) {
        throw new CustomError(`Error updating branch: ${error.message}`, 500);
    }
};

// Delete a branch
const deleteBranch= async (id) => {
    try {
        await prisma.hrms_m_branch_master.delete({
            where: { id: parseInt(id) },
        });
    } catch (error) {
        throw new CustomError(`Error deleting branch: ${error.message}`, 500);
    }
};

// Get all branchs
const getAllBranch = async (  page,
    size,
    search,
    startDate,
    endDate) => {
    try {
        page = page || page == 0 ? 1 : page;
        size = size || 10;
        const skip = (page - 1) * size || 0;
    
        const filters = {};
        // Handle search
        // if (search) {
        //   filters.OR = [
        //     {
        //       campaign_user: {
        //         full_name: { contains: search.toLowerCase() },
        //       }, // Include contact details
        //     },
        //     {
        //       campaign_leads: {
        //         title: { contains: search.toLowerCase() },
        //       }, // Include contact details
        //     },
        //     {
        //       name: { contains: search.toLowerCase() },
        //     },
        //     {
        //       status: { contains: search.toLowerCase() },
        //     },
        //   ];
        // }
        // if (status) {
        //   filters.is_active = { equals: status };
        // }
    
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
    
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            filters.createdate = {
              gte: start,
              lte: end,
            };
          }
        }
        const branches = await prisma.hrms_m_branch_master.findMany({
        //   where: filters,
          skip: skip,
          take: size,

          orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
        });

        const totalCount = await prisma.hrms_m_branch_master.count({
        //   where: filters,
        });
        return {
          data: branches,
          currentPage: page,
          size,
          totalPages: Math.ceil(totalCount / size),
          totalCount: totalCount,
        };

    } catch (error) {
        console.log(error)
        throw new CustomError('Error retrieving branches', 503);
    }
};

module.exports = {
    createBranch,
    findBranchById,
    updateBranch,
    deleteBranch,
    getAllBranch,
};
