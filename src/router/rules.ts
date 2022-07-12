import { RuleController } from "../controller";
import * as express from "express";
import validator, { ruleValidator } from "../ultis/validate";
import ultis from "../ultis/ultis";
const ruleRouter = express.Router();

ruleRouter.get('/', ultis.getPagination, RuleController.getRules);
ruleRouter.post('/', ruleValidator.addRule, RuleController.addRule);
ruleRouter.delete('/:ruleId', ruleValidator.deleteRule, RuleController.deleteRule);
ruleRouter.put('/:ruleId', ruleValidator.updateRule, RuleController.updateRule);


export default ruleRouter;