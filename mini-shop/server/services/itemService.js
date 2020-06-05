const ItemModel = require('../models/mongoose/Item');

async function getAll() {
    return ItemModel.find({}).sort({createdAT: -1});
}

async function getOne(itemId) {
    return ItemModel.findOne({_id: itemId});
}

async function create(data) {
    const item = new ItemModel(data);
    return item.save();
}

async function update(itemId, data) {
    const item = await getOne(itemId);

    if(!item) throw new Error('Could not find the requested item');

    Object.keys(data).forEach((key) => {
        item[key] = data[key]
    });

    return item.save();
}

async function remove(itmeId) {
    const result = await ItemModel.findByIdAndRemove(itmeId);    
    return Object.keys(result).length;
}

module.exports = {
    getAll, 
    getOne,
    create,
    update,
    remove
};