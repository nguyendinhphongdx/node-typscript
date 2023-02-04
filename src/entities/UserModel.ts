 // @ts-nocheck
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { UserProps } from 'types';
import { sequelize } from '../../database';
interface UserTypeModel extends UserProps, Model<InferAttributes<UserTypeModel>, InferCreationAttributes<UserTypeModel>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const UserModel = sequelize.define<UserTypeModel>("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
    },
    password: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user',
        values: ['user', 'admin'],
    }
});

export default UserModel;