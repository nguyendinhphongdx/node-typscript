import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { Collector } from 'types';
import { sequelize } from '../../database';
interface CollectorType extends Collector, Model<InferAttributes<CollectorType>, InferCreationAttributes<CollectorType>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
}
const CollectorModel = sequelize.define<CollectorType>("collectors", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    active: DataTypes.BOOLEAN,
    hostName: DataTypes.STRING,
    role: DataTypes.STRING,
    ipAddress: DataTypes.STRING,
    fileBeat: DataTypes.JSON,
    logstash: DataTypes.JSON
});

export default CollectorModel;