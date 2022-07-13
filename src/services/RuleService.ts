import { RuleModel } from "../entities";
import { RuleProps } from "types";
import { Op } from "sequelize";

class RuleService {
    async createRecord(rule: RuleProps) {
        try {
            const exists = await RuleModel.findOne({
                where: {
                    ruleName: rule.ruleName, ruleType: rule.ruleType, version: rule.version
                }
            });
            if (exists) throw new Error('rule is exists');
            return RuleModel.create(rule);
        } catch (error) {
            throw error;
        }
    }
    async findOne(ruleName: string, ruleType: string, version: string) {
        try {
            const exists = await RuleModel.findOne({
                where: {
                    ruleName, ruleType, version
                }
            });
            if (!exists) throw new Error('rule is exists');
            return exists;
        } catch (error) {
            throw error;
        }
    }
}
export default new RuleService();