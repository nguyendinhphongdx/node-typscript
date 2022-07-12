import { sequelize } from '../../database';
import GroupModel from './GroupModel';
import MinionModel from './MinionsModel';
const MinionGroupModel = sequelize.define("minions_groups", {});
GroupModel.belongsToMany(MinionModel, { through: MinionGroupModel });
MinionModel.belongsToMany(GroupModel, { through: MinionGroupModel });
export default MinionGroupModel;