import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { AppConfig, GrafanaProps } from 'types';
import { sequelize } from '../../database';
import getConfig from '../../config';
const producers: string[] = getConfig('rule').producers;
interface GrafanaTypeModel extends GrafanaProps, Model<InferAttributes<GrafanaTypeModel>, InferCreationAttributes<GrafanaTypeModel>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const GrafanaModel = sequelize.define<GrafanaTypeModel>("grafanas", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    grafanaName: {
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
    producer: {
        type: DataTypes.STRING,
        values: producers,
        defaultValue: producers[0]
    }
});

export default GrafanaModel;