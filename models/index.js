const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Importa los modelos
const Pokemon = require('./Pokemon')(sequelize, Sequelize.DataTypes);
const Type = require('./Type')(sequelize, Sequelize.DataTypes);
const Region = require('./Region')(sequelize, Sequelize.DataTypes);

// Define las asociaciones
Pokemon.belongsTo(Type);
Pokemon.belongsTo(Region);
Type.hasMany(Pokemon);
Region.hasMany(Pokemon);

module.exports = {
    sequelize,
    Pokemon,
    Type,
    Region
};