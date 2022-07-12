import { RuleLogController } from "../controller";
import * as express from "express";
import validator, { ruleLogValidator, ruleValidator } from "../ultis/validate";
import ultis from "../ultis/ultis";
const ruleLogRouter = express.Router();

ruleLogRouter.get('/', ultis.getPagination, RuleLogController.getRules);
ruleLogRouter.post('/', ruleLogValidator.addRule, RuleLogController.addRule);
ruleLogRouter.delete('/:ruleId', ruleLogValidator.deleteRule, RuleLogController.deleteRule);
ruleLogRouter.put('/:ruleId', ruleLogValidator.updateRule, RuleLogController.updateRule);



export default ruleLogRouter;