import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { RuleLog } from 'types';
import { sequelize } from '../../database';
import LogSourceModel from './LogSourceModel';
interface RuleLogType extends RuleLog, Model<InferAttributes<RuleLogType>, InferCreationAttributes<RuleLogType>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const RuleLogModel = sequelize.define<RuleLogType>("logRules", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
    },
    chain: {
        type: DataTypes.STRING,
    },
    protocol: {
        type: DataTypes.STRING,
    },
    dports: {
        type: DataTypes.JSON,
    },
    source: {
        type: DataTypes.STRING,
    },
    action: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    category: {
        type: DataTypes.INTEGER
    },
    minionsId:{
        type: DataTypes.JSON
    },
    tags: {
        type: DataTypes.JSON
    }
});
export default RuleLogModel;