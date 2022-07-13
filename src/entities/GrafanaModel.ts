import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { GrafanaProps } from 'types';
import { producer } from '../ultis/Constant';
import { sequelize } from '../../database';
interface GrafanaTypeModel extends GrafanaProps, Model<InferAttributes<GrafanaTypeModel>, InferCreationAttributes<GrafanaTypeModel>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const GrafanaModel = sequelize.define<GrafanaTypeModel>("grafanas", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    grafanaName:{
        type: DataTypes.STRING,
        allowNull: false
    },
    path:{
        type: DataTypes.STRING,
    },
    version: {
        type: DataTypes.STRING,
    },
    size: {
        type: DataTypes.FLOAT
    },
    fileType:{
        type: DataTypes.STRING,
    },
    producer:{
        type: DataTypes.STRING,
        defaultValue: producer
    }
});

export default GrafanaModel;