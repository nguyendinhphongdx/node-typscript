import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { Group } from 'types';
import { sequelize } from '../../database';
interface GroupType extends Group,Model<InferAttributes<GroupType>, InferCreationAttributes<GroupType>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const GroupModel = sequelize.define<GroupType>("groups", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    groupName: {
        type: DataTypes.STRING,
    },
    description:{
        type: DataTypes.STRING,
    }
});
// GroupModel.sync({force: false});

export default GroupModel;