const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Region extends Model {
        static associate(models) {
            Region.hasMany(models.Pokemon);
        }
    }

    Region.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        sequelize,
        modelName: 'Region',
        timestamps: false
    });

    return Region;
};