import * as express from "express";
import ultis from "../ultis/ultis";
import { RuleController } from "../controller";
import upload from "../middleware/upload";
import { validatorRule } from "../ultis/validate";

const ruleRouter = express.Router();

ruleRouter.get('/', ultis.getPagination, RuleController.getUploadedRules);
ruleRouter.post('/upload', upload.array('attachment', 1), validatorRule.uploadRule, RuleController.uploadRule);
ruleRouter.patch('/:ruleId', validatorRule.downloadRule, RuleController.downloadRule);


export default ruleRouter;