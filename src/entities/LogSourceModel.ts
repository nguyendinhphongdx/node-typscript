import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { LogSource } from 'types';
import { sequelize } from '../../database';
import RuleLogModel from './RuleLogModel';
import RuleModel from './RuleModel';
interface LogSourceType extends LogSource, Model<InferAttributes<LogSourceType>, InferCreationAttributes<LogSourceType>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const LogSourceModel = sequelize.define<LogSourceType>("log_sources", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sourceName: {
        type: DataTypes.STRING,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
    },
});
LogSourceModel.hasMany(RuleLogModel);
RuleLogModel.belongsTo(LogSourceModel);

export default LogSourceModel;