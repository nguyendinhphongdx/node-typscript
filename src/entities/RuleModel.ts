import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { Rule } from 'types';
import { sequelize } from '../../database';
interface RuleType extends Rule,Model<InferAttributes<RuleType>, InferCreationAttributes<RuleType>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const RuleModel = sequelize.define<RuleType>("rules", {
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
    tags: {
        type: DataTypes.JSON
    }
});
export default RuleModel;