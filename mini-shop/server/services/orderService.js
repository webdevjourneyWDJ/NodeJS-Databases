const Models = require('../models/sequelize');

let client = null;
let models = null;

module.exports = (_client) => {
    models = Models(_client);
    client = _client;

    return {};
}