import { RuleModel } from "../entities";
import { RuleProps } from "types";

class RuleService {
   async createRecord(rule: RuleProps){
        try {
            const exists = await RuleModel.findOne({where: {ruleName: rule.ruleName, ruleType: rule.ruleType}});
            if(exists) throw new Error('rule is exists');
            return RuleModel.create(rule);
        } catch (error) {
            throw error;
        }
   }
}
export default new RuleService();