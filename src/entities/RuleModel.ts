import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { RuleProps } from 'types';
import { sequelize } from '../../database';
import getConfig from '../../config';
const producers: string[] = getConfig('rule').producers;
interface RuleTypeModel extends RuleProps, Model<InferAttributes<RuleTypeModel>, InferCreationAttributes<RuleTypeModel>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const RuleModel = sequelize.define<RuleTypeModel>("rules", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    path:{
        type: DataTypes.STRING,
    },
    ruleName:{
        type: DataTypes.STRING,
    },
    ruleType: {
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
    description: {
        type: DataTypes.STRING,
    },
    producer:{
        type: DataTypes.STRING,
        values: producers,
        defaultValue: producers[0]
    }
});

export default RuleModel;