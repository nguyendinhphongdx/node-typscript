
import * as express from 'express';
import { RuleLog } from 'types';
import ultis from '../ultis/ultis';
import { MinionModel, LogSourceModel, RuleLogModel, MachineModel, RuleModel } from '../entities';
import { RuleService } from '../services';
import { AppConfig } from '../types/config';
import getConfig from '../../config';
import { CodeExecCMDS, TypeOfRule } from '../ultis/Constant';
import { Op } from 'sequelize';

const appConfig: AppConfig = getConfig('app');
class RuleLogController {
    async getRules(req: express.Request, res: express.Response) {
        try {
            const { limit, offset, page, search, source, machine, minion } = req.query;
            const condition = {
                model: LogSourceModel,
                where: {
                    id: source
                },
                include: [{
                    model: MachineModel,
                    where: {
                        id: machine
                    }
                }]
            };
            if(!source) delete condition.where;
            if(!machine) delete condition.include[0].where;
            const rules = await RuleLogModel.findAndCountAll({
                include: [condition],
                limit: Number(limit), offset: Number(offset),
                where: {
                    category: TypeOfRule.LOGSOURCE,
                }
            });
            let resultSearch: RuleLog[] = [];
            if (search && typeof search === 'string') {
                for (let index = 0; index < rules.rows.length; index++) {
                    const itemRule = rules.rows[index];
                    if ((itemRule.tags && Array.isArray(itemRule.tags) && itemRule.tags.includes(search))
                        || itemRule.chain.includes(search)
                        || itemRule.source.includes(search)) {
                        resultSearch.push(itemRule);
                    }
                }
            } else {
                resultSearch = rules.rows;
            }
            if (minion && Number(minion)) {
                resultSearch = resultSearch.filter(item => item.minionsId.includes(Number(minion)));
            } 
            resultSearch = await RuleService.RuleLogMapMinionInfoByMinionIds(resultSearch);
            const pagingData = ultis.getPagingData({ rows: resultSearch, count: resultSearch.length }, page, limit);
            
            return ultis.response(res, 200, pagingData, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async addRule(req: express.Request, res: express.Response) {
        try {
            // step 1 check data request
            const { name, chain, dports, protocol, action, sourceLogId, description, minionsId, tags = [] } = req.body;

            if (dports.some(p => !Number(p))) throw new Error('port must be number');


            // step 2 check exists logsource and find Machine
            const sourceLog = await LogSourceModel.findOne({ where: { id: sourceLogId } });
            if (!sourceLog) throw new Error('logsource not found');
            const machine = await MachineModel.findOne({ where: { id: sourceLog.machineId } });
            const rule: RuleLog = { name, chain, source: machine.ip, dports, protocol, action, description, category: TypeOfRule.LOGSOURCE, minionsId, tags };

            // step check rule exists
            const existsRules = await RuleService.checkRuleExists(rule);
            if (existsRules) throw new Error('rule is already exists');

            //   step 2 check exists all minions
            const promises = minionsId.map((minionId: number) => MinionModel.findOne({ where: { id: minionId } }));
            const handler = await Promise.all(promises);
            const minions = [];
            handler.forEach((handle, index: number) => {
                if (!handle) throw new Error(`minion with id ${minionsId[index]} not found`);
                minions.push(handle.dataValues);
            })

            // step 3 exec cmd add rule bypass ssh
            const cmds = minions.map(minion => {
                let cmd: string;
                if (minion.hostName !== appConfig.deployOnMinion) {
                    cmd = RuleService.generateComnandAddRuleWithMinion(rule, minion);
                } else {
                    cmd = RuleService.generateComnandAddRule(rule);
                }
                if (!cmd) throw new Error(`generate command add rule failed`);
                return cmd;
            })

            const logs = await RuleService.execMultiCommandSSH(cmds);
            logs.forEach(log => {
                if (log.logs.result !== CodeExecCMDS.OK) throw new Error('exec cmd failed: ' + log.cmd);
            })

            // step 4 save rule
            const r = await RuleLogModel.create({ logSourceId: sourceLogId, ...rule });

            return ultis.response(res, 200, r, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async deleteRule(req: express.Request, res: express.Response) {
        try {
            const { ruleId } = req.params;
            // step 1 check exists rule
            const exists: any = await RuleLogModel.findOne({ where: { id: ruleId } });
            if (!exists) throw new Error('Cannot find rule with id ' + ruleId);
            // step 2 get minons from rule
            const promises = exists.minionsId.map((minionId: number) => MinionModel.findOne({ where: { id: minionId } }));
            const handler = await Promise.all(promises);
            const minions = [];
            handler.forEach((handle, index: number) => {
                minions.push(handle.dataValues);
            })

            // step 3 create cmd delete rule and ssh execute
            const { name, chain, source, dports, protocol, action } = exists.dataValues;

            const rule: RuleLog = { name, chain, source, dports, protocol, action, category: TypeOfRule.LOGSOURCE };
            const cmds = minions.map(minion => {
                let cmd: string;
                if (minion.hostName !== appConfig.deployOnMinion) {
                    cmd = RuleService.generateComnandRemoveRuleWithMinion(rule, minion);
                } else {
                    cmd = RuleService.generateComnandRemoveRule(rule);
                }
                if (!cmd) throw new Error(`generate command delete rule failed`);
                return cmd;
            })
            const logs = await RuleService.execMultiCommandSSH(cmds);
            logs.forEach(log => {
                if (log.logs.result !== CodeExecCMDS.OK) throw new Error('exec cmd failed: ' + log.cmd);
            })

            // step 3 remove rule
            exists.destroy();

            return ultis.response(res, 200, { logs, minions }, "delete success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async updateRule(req: express.Request, res: express.Response) {
        try {
            // step 1 check data request
            const { name, dports, protocol, action, description, minionsId, tags = [] } = req.body;
            const { ruleId } = req.params;
            if (dports.some(p => !Number(p))) throw new Error('port must be number');

            // step 2 check exist rules 
            const exists = await RuleLogModel.findByPk(ruleId);
            if (!exists) throw new Error('Rule not found');

            const sourceLog = await LogSourceModel.findByPk(exists.logSourceId);
            const machine = await MachineModel.findOne({ where: { id: sourceLog.machineId } });
            // create new rule
            const rule: RuleLog = { name, chain: exists.chain, source: machine.ip, dports, protocol, action, description, category: TypeOfRule.LOGSOURCE, tags };

            const existsRules = await RuleService.checkRuleExists(rule);
            if (existsRules) throw new Error('rule is already exists with information');

            //step 4 get all old minion
            const oldPromises = exists.minionsId.map((minionId: number) => MinionModel.findOne({ where: { id: minionId } }));
            const oldHandler = await Promise.all(oldPromises);
            const OldMinions = [];
            oldHandler.forEach((handle: any, index: number) => {
                OldMinions.push(handle.dataValues);
            })
            const cmdsRemove = OldMinions.map(minion => {
                let cmd: string;
                if (minion.hostName !== appConfig.deployOnMinion) {
                    cmd = RuleService.generateComnandRemoveRuleWithMinion(rule, minion);
                } else {
                    cmd = RuleService.generateComnandRemoveRule(rule);
                }
                if (!cmd) throw new Error(`generate command delete rule failed`);
                return cmd;
            })
            const logsRemove = await RuleService.execMultiCommandSSH(cmdsRemove);
            logsRemove.forEach(log => {
                if (log.logs.result !== CodeExecCMDS.OK) throw new Error('exec cmd failed: ' + log.cmd);
            })

            // step 4 get all new minion
            const promises = minionsId.map((minionId: number) => MinionModel.findOne({ where: { id: minionId } }));
            const handler = await Promise.all(promises);
            const newMinions = [];
            handler.forEach((handle, index: number) => {
                if (!handle) throw new Error(`minion with id ${minionsId[index]} not found`);
                newMinions.push(handle.dataValues);
            })
            // step 5 get uniqueMinions
            const minionsUnique = ultis.uniqueSetArrayObject(newMinions, 'id');

            // step 6 get line number of rules
            const lines = minionsUnique.map(minion => {
                let line: string;
                if (minion.hostName !== appConfig.deployOnMinion) {
                    line = RuleService.generateComnandRuleLineNumberWithMinion(exists, minion);
                } else {
                    line = RuleService.generateComnandRuleLineNumber(exists);
                }
                if (!line) throw new Error(`generate command line rule failed`);
                return line;
            })
            const logLines = await RuleService.execMultiCommandSSH(lines);

            logLines.forEach(log => {
                if (log.logs.result !== CodeExecCMDS.OK) throw new Error('exec cmd failed: ' + log.cmd);
            })

            const lineNumber: number[] = logLines.map((line) => {
                if (line.logs.stdout[0] && line.logs.stdout[0].split(' ')[0]) {
                    return Number(line.logs.stdout[0].split(' ')[0]);
                }
                throw new Error(`get rule line number failed: ${line.logs.stdout}`);
            })
            // step 7 gennerate cmd update rules with lines number
            const cmds = minionsUnique.map((minion, index) => {
                let cmd: string;
                if (minion.hostName !== appConfig.deployOnMinion) {
                    cmd = RuleService.generateComnandUpdateWithMinion(rule, minion, lineNumber[index]);
                } else {
                    cmd = RuleService.generateComnandUpdate(rule, lineNumber[index]);
                }
                if (!cmd) throw new Error(`generate command update rule failed`);
                return cmd;
            })

            // step 8 exec cmds
            const logs = await RuleService.execMultiCommandSSH(cmds);
            logs.forEach(log => {
                if (log.logs.result !== CodeExecCMDS.OK) throw new Error('exec cmd failed: ' + log.cmd);
            })

            // step 9 save rule
            exists.update(rule);

            // return ultis.response(res, 200, { minionsUnique, logs }, "success");
            return ultis.response(res, 200, exists, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new RuleLogController();