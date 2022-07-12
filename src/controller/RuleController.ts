
import * as express from 'express';
import ultis from '../ultis/ultis';

import { RuleModel } from '../entities';
import { RuleProps } from 'types';
import { RuleService } from '../services';
class RuleController {
    block: boolean;
    constructor() {
        this.block = false;
    }
    async getCollectors(req: express.Request, res: express.Response) {
        try {
            const { limit, offset, page, role } = req.query;
            const condition = {
                limit: Number(limit), offset: Number(offset)
            }
            if (!page) {
                delete condition.offset;
                delete condition.limit;
            }
            const collector = await RuleModel.findAndCountAll(condition);
            const dataPageing = ultis.getPagingData(collector, page, limit);
            return ultis.response(res, 200, dataPageing, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async uploadRule(req: express.Request, res: express.Response){
        try {
            const {files} = req;
            const rule: RuleProps = {
                ruleName: req.body.ruleName,
                ruleType: req.body.ruleType,
                version: req.body.version,
                path: files[0].path,
            }
            const created = await RuleService.createRecord(rule);
            return ultis.response(res, 200, created, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new RuleController();