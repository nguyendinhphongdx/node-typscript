import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { AppConfig, OnionProps } from 'types';
import { sequelize } from '../../database';
import getConfig from '../../config';
const producers: string[] = getConfig('rule').producers;
interface OnionPropsTypeModel extends OnionProps, Model<InferAttributes<OnionPropsTypeModel>, InferCreationAttributes<OnionPropsTypeModel>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const OnionModel = sequelize.define<OnionPropsTypeModel>("onions", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nameVersion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING,
    },
    version: {
        type: DataTypes.STRING,
    },
    size: {
        type: DataTypes.FLOAT
    },
    fileType: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    producer: {
        type: DataTypes.STRING,
        values: producers,
        defaultValue: producers[0]
    }
});

export default OnionModel;