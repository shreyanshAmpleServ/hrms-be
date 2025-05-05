const AttachmentModel = require('../models/FileAttachmentModel');

const createAttachment = async (data) => {
    return await AttachmentModel.createAttachment(data);
};

const findAttachmentById = async (id) => {
    return await AttachmentModel.findAttachmentById(id);
};

const updateAttachment = async (id, data) => {
    return await AttachmentModel.updateAttachment(id, data);
};

const deleteAttachment = async (id) => {
    return await AttachmentModel.deleteAttachment(id);
};

const getAllAttachment = async (search ,page , size ,startDate,endDate,related_type) => {
    return await AttachmentModel.getAllAttachment(search ,page , size ,startDate,endDate,related_type);
};

module.exports = {
    createAttachment,
    findAttachmentById,
    updateAttachment,
    deleteAttachment,
    getAllAttachment,
};
