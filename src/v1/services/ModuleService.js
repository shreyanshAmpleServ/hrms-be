const moduleModel = require('../models/ModuleModel');

const createModuleRelatedTo = async (data) => {
    return await moduleModel.createModuleRelatedTo(data);
};

const updateModuleRelatedTo = async (id, data) => {
    return await moduleModel.updateModuleRelatedTo(id, data);
};

const deleteModuleRelatedTo = async (id) => {
    return await moduleModel.deleteModuleRelatedTo(id);
};

const getModuleRelatedTos = async (search,page,size) => {
    return await moduleModel.getModuleRelatedTos(search,page,size);
};

module.exports = {
    createModuleRelatedTo,
    updateModuleRelatedTo,
    deleteModuleRelatedTo,
    getModuleRelatedTos,
};
