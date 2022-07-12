
import * as express from 'express';

import ultis from '../ultis/ultis';
import { LogSourceModel, MachineModel, MinionModel, RuleLogModel } from '../entities';
import getConfig from '../../config';
import { AppConfig } from '../types/config';
import { LogSource } from 'types';
import { RuleService } from '../services';
import { CodeExecCMDS } from '../ultis/Constant';
const appConfig: AppConfig = getConfig('app');

class LogSourceController {
    async getLogSources(req: express.Request, res: express.Response) {
        try {
            const { limit, offset, page } = req.query;
            const condition = {
                include: [RuleLogModel, MachineModel],
                limit: Number(limit), offset: Number(offset)
            }
            if (!page) {
                delete condition.limit;
                delete condition.offset;
            }
            const sources = await LogSourceModel.findAndCountAll(condition);
            const dataPageing = ultis.getPagingData(sources, page, limit);
            return ultis.response(res, 200, dataPageing, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async addLogSource(req: express.Request, res: express.Response) {
        try {
            const { sourceName, description, machineId } = req.body;
            const source: LogSource = { sourceName, description, machineId };
            const machineExists = await MachineModel.findOne({ where: { id: machineId } });
            if (!machineExists) throw new Error('Machine not found');
            const sourceModel = await LogSourceModel.create(source);
            return ultis.response(res, 200, sourceModel, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async updateSource(req: express.Request, res: express.Response) {
        try {
            const { sourceName, description } = req.body;
            const { sourceId } = req.params;
            const source: LogSource = { sourceName, description };
            const sourceModel = await LogSourceModel.findOne({ where: { id: sourceId } });
            if (!sourceModel) throw new Error('Source not found');
            sourceModel.update(source);
            return ultis.response(res, 200, sourceModel, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async deleteSource(req: express.Request | any, res: express.Response) {
        try {
            const { sourceId } = req.params;
            // step 1 find sourcelog
            const sourceModel = await LogSourceModel.findOne({ where: { id: sourceId } });
            if (!sourceModel) throw new Error('Source not found');

            // step 2 find all log rule by source log delete 
            const logRules = await RuleLogModel.findAll({ where: { logSourceId: sourceId } });
            const cmds = [];

            for (let index = 0; index < logRules.length; index++) {
                const rule = logRules[index];
                const handler = rule.minionsId.map((minionId: number) => MinionModel.findOne({ where: { id: minionId } }));
                const minionModel = await Promise.all(handler);
                minionModel.forEach(minion => {
                    let cmd: string;
                    if (minion.hostName !== appConfig.deployOnMinion) {
                        cmd = RuleService.generateComnandRemoveRuleWithMinion(rule, minion);
                    } else {
                        cmd = RuleService.generateComnandRemoveRule(rule);
                    }
                    if (!cmd) throw new Error(`generate command remove rule failed`);
                    cmds.push(cmd);
                })
            }
            const logs = await RuleService.execMultiCommandSSH(cmds);
            logs.forEach(log => {
                if (log.logs.result !== CodeExecCMDS.OK) throw new Error('exec cmd failed: ' + log.cmd);
            })
            // delete source log
            sourceModel.destroy();
            // delete rule logs
            for (let index = 0; index < logRules.length; index++) {
                logRules[index].destroy();
            }
            if (!res) return sourceModel;
            return ultis.response(res, 200, sourceModel, "success");
        } catch (error) {
            if (!res) throw error;
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new LogSourceController();