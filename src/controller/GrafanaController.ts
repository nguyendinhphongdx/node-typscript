
import * as express from 'express';
import * as fs from 'fs';
import { Op } from 'sequelize';

import ultis from '../ultis/ultis';

import { RuleModel, GrafanaModel } from '../entities';
import { GrafanaProps, RuleProps } from 'types';
import {GrafanaService} from '../services';
class GrafanaController {
    block: boolean;
    constructor() {
        this.block = false;
    }
    async getUploadedGrafana(req: express.Request, res: express.Response) {
        try {
            const { limit, offset, page, role } = req.query;
            const condition = {
                limit: Number(limit), offset: Number(offset)
            }
            if (!page) {
                delete condition.offset;
                delete condition.limit;
            }
            const rules = await GrafanaModel.findAndCountAll(condition);
            const dataPageing = ultis.getPagingData(rules, page, limit);
            return ultis.response(res, 200, dataPageing, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async uploadGrafana(req: express.Request, res: express.Response) {
        const { files } = req;
        try {
            const grafana: GrafanaProps = {
                grafanaName: req.body.grafanaName,
                description: req.body.description,
                version: req.body.version,
                path: files[0].path,
                fileType: files[0].mimetype,
                size: files[0].size,
                producer: req.body.producer,
            }
            const created = await GrafanaService.createRecord(grafana);
            return ultis.response(res, 200, created, "success");
        } catch (error) {
            fs.existsSync(files[0].path) && fs.unlinkSync(files[0].path);
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async downloadGrafana(req: express.Request, res: express.Response) {
        try {
            const { ruleId } = req.params;
            const rule = await RuleModel.findOne({ where: { id: ruleId } });
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
    async updateGrafana(req: express.Request, res: express.Response) {
        try {
            const { grafanaId } = req.params;
            const grafana = await GrafanaModel.findOne({ where: { id: grafanaId } });
            if (!grafana) throw new Error('grafana not found');
            const {grafanaName, version} = req.body;
            const exists = await GrafanaModel.findOne({
                where: {
                    grafanaName, version, id: {
                        [Op.not]: grafana.id
                    }
                }
            });
            if (exists) throw new Error('grafana is already exists');
            const result = await grafana.update({
                grafanaName: req.body.grafanaName,
                version: req.body.version,
                description: req.body.description,
                producer: req.body.producer,
            });
            return ultis.response(res, 200, result, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async deleteGrafana(req: express.Request, res: express.Response) {
        try {
            const { grafanaId } = req.params;
            const grafana = await GrafanaModel.findOne({ where: { id: grafanaId } });
            if (!grafana) throw new Error('grafana not found');
            const result = await grafana.destroy();
            return ultis.response(res, 200, result, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new GrafanaController();