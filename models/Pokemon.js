// models/Pokemon.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Pokemon extends Model {
        static associate(models) {
            Pokemon.belongsTo(models.Type);
            Pokemon.belongsTo(models.Region);
        }
    }

    Pokemon.init({
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
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        TypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Types',
                key: 'id'
            }
        },
        RegionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Regions',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'Pokemon',
        timestamps: false
    });

    return Pokemon;
};