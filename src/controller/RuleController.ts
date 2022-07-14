
import * as express from 'express';
import * as fs from 'fs';
import { Op } from 'sequelize';

import ultis from '../ultis/ultis';

import { RuleModel } from '../entities';
import { RuleProps } from 'types';
import { RuleService } from '../services';
class RuleController {
    block: boolean;
    constructor() {
        this.block = false;
    }
    async getUploadedRules(req: express.Request, res: express.Response) {
        try {
            const { limit, offset, page, producer } = req.query;
            const condition = {
                where: {
                    producer: producer + ''
                },
                limit: Number(limit), offset: Number(offset)
            }
            if (!page) {
                delete condition.offset;
                delete condition.limit;
            }
            if (!producer) {
                delete condition.where;
            }
            const rules = await RuleModel.findAndCountAll(condition);
            const converted = rules.rows.map((rule:any) => {
                return {
                    ...rule.dataValues,
                    version: Number(rule.version)
                }
            })
            const dataPageing = ultis.getPagingData({ rows: converted, count: rules.count }, page, limit);
            return ultis.response(res, 200, dataPageing, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async uploadRule(req: express.Request, res: express.Response) {
        const { files } = req;
        try {
            const rule: RuleProps = {
                ruleName: req.body.ruleName,
                ruleType: req.body.ruleType,
                nameVersion: req.body.nameVersion,
                description: req.body.description,
                version: req.body.version,
                path: files[0].path,
                fileType: files[0].mimetype,
                size: files[0].size,
                producer: req.body.producer,
            }
            const created = await RuleService.createRecord(rule);
            return ultis.response(res, 200, created, "success");
        } catch (error) {
            fs.existsSync(files[0].path) && fs.unlinkSync(files[0].path);
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async downloadRule(req: express.Request, res: express.Response) {
        try {
            const { ruleId } = req.params;
            const rule = await RuleModel.findOne({ where: { id: ruleId } });
            if (!rule) throw new Error('rule not found');
            if (fs.existsSync(rule.path)) {
                const buffer = fs.readFileSync(rule.path);
                const fileName = ultis.generateNameFileRule(rule.ruleType, rule.ruleName);
                res.writeHead(200, {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": "attachment; filename=" + fileName,
                    // "Content-Length": stat.size
                });
                res.write(buffer);
                res.end();
            } else {
                throw new Error('file is not exists');
            }
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async updateRule(req: express.Request, res: express.Response) {
        try {
            const { ruleId } = req.params;
            const rule = await RuleModel.findOne({ where: { id: ruleId } });
            if (!rule) throw new Error('rule not found');
            const content = await RuleService.checkFileContentAccept(rule.path);
            req.body.ruleType = content.type;
            req.body.ruleName = content.name;
            const { ruleName, ruleType, version } = req.body;
            const exists = await RuleModel.findOne({
                where: {
                    ruleName, ruleType, version, id: {
                        [Op.not]: rule.id
                    }
                }
            });
            if (exists) throw new Error('rule is already exists');
            const result = await rule.update({
                ruleName: req.body.ruleName,
                ruleType: req.body.ruleType,
                version: req.body.version,
                description: req.body.description,
                producer: req.body.producer,
                nameVersion: req.body.nameVersion,
            });
            return ultis.response(res, 200, result, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async deleteRule(req: express.Request, res: express.Response) {
        try {
            const { ruleId } = req.params;
            const rule = await RuleModel.findOne({ where: { id: ruleId } });
            if (!rule) throw new Error('rule not found');
            const result = await rule.destroy();
            return ultis.response(res, 200, result, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new RuleController();