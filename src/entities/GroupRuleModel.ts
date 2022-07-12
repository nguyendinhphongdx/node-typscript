import { sequelize } from '../../database';
import GroupModel from './GroupModel';
import RuleModel from './RuleModel';
const GroupRuleModel = sequelize.define("groups_rules", {});
GroupModel.belongsToMany(RuleModel, { through: GroupRuleModel });
RuleModel.belongsToMany(GroupModel, { through: GroupRuleModel });
export default GroupRuleModel;