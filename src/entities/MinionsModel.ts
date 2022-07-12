import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { Minion } from 'types';
import { sequelize } from '../../database';
interface MinionType extends Minion,Model<InferAttributes<MinionType>, InferCreationAttributes<MinionType>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const MinionModel = sequelize.define<MinionType>("minions", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    hostName: DataTypes.STRING,
    role: DataTypes.STRING,
    ipAddress: DataTypes.STRING,
});
// MinionModel.sync({force: true});
export default MinionModel;