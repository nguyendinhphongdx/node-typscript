import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { TypeConfigModel } from 'types';
import { sequelize } from '../../database';
interface ConfigType extends TypeConfigModel, Model<InferAttributes<ConfigType>, InferCreationAttributes<ConfigType>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const ConfigModel = sequelize.define<ConfigType>("configs", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    key: {
        type: DataTypes.STRING,
    },
    path: {
        type: DataTypes.STRING,
    },
    value: {
        type: DataTypes.JSON,
    },
    block: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
// GroupModel.sync({force: false});

export default ConfigModel;