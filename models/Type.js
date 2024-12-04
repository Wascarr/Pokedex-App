const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Type extends Model {
        static associate(models) {
            Type.hasMany(models.Pokemon);
        }
    }

    Type.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Type',
        timestamps: false
    });

    return Type;
};