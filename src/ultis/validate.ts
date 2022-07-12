import * as express from "express";
import getConfig from "../../config";
import ultis from "./ultis";
const ruleTypes:string[] = getConfig('rule').ruleTypes;
export const validatorRule = {
    uploadRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if(!req.files || req.files.length <1 || req.files[0].fieldname !== 'attachment') throw new Error('attachment is missing or invalid');
            if(!req.body.ruleType || !ruleTypes.includes(req.body.ruleType)) throw new Error('ruleType is missing or invalid');
            if(!req.body.ruleName) throw new Error('ruleName is missing or invalid');
            if(!req.body.version) throw new Error('version is missing or invalid');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error)
        }
    }
}