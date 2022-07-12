
import * as express from 'express';
import ultis from '../ultis/ultis';

import { CollectorModel } from '../entities';
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
            const collector = await CollectorModel.findAndCountAll(condition);
            const dataPageing = ultis.getPagingData(collector, page, limit);
            return ultis.response(res, 200, dataPageing, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new RuleController();