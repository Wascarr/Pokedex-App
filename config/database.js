const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false,
    define: {
        timestamps: false // Deshabilitamos los timestamps globalmente
    }
});

module.exports = sequelize;