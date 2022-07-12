import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { MachineState } from 'types';
import { sequelize } from '../../database';
import LogSourceModel from './LogSourceModel';
interface MachineType extends MachineState, Model<InferAttributes<MachineType>, InferCreationAttributes<MachineType>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const MachineModel = sequelize.define<MachineType>("machines", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
    },
    ip: {
        type: DataTypes.STRING,
        unique: true
    },
    mac: {
        type: DataTypes.STRING,
    },
    location: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
});
MachineModel.hasMany(LogSourceModel);
LogSourceModel.belongsTo(MachineModel);
export default MachineModel;