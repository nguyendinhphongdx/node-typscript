
import * as express from 'express';
import { Rule } from 'types';
import ultis from '../ultis/ultis';
import { GroupModel, GroupRuleModel, RuleModel, MinionModel, RuleLogModel } from '../entities';
import { RuleService } from '../services';
import { AppConfig } from '../types/config';
import getConfig from '../../config';
import { CodeExecCMDS, TypeOfRule } from '../ultis/Constant';

const appConfig: AppConfig = getConfig('app');
class RuleController {
    async getRules(req: express.Request, res: express.Response) {
        try {
            const { limit, offset, page, search, group, minion } = req.query;
            const condition = {
                model: GroupModel,
                where: {
                    id: group
                },
                include: [{
                    model: MinionModel,
                    where: {
                        id: minion
                    }
                }]
            };
            if (!group) delete condition.where;
            if (!minion) delete condition.include[0].where;
            const rules = await RuleModel.findAndCountAll({
                include: [condition],
                limit: Number(limit), offset: Number(offset),
                where: {
                    category: TypeOfRule.FIREWALL,
                }
            });
            let resultSearch = [];
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
            const pagingData = ultis.getPagingData({ rows: resultSearch, count: resultSearch.length }, page, limit);
            return ultis.response(res, 200, pagingData, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async addRule(req: express.Request, res: express.Response) {
        try {
            // step 1 check data request
            const { name, chain, source, dports, protocol, action, groups, description, tags = [] } = req.body;
            if (!groups && !Array.isArray(groups)) throw new Error(`groups is missing or not an array`);
            if (groups.length === 0) throw new Error(`The rule must be in at least one group of rules`);
            if (dports.some(p => !Number(p))) throw new Error('port must be number');

            const rule: Rule = { name, chain, source, dports, protocol, action, description, category: TypeOfRule.FIREWALL, tags };

            // step check rule exists
            const existsRules = await RuleService.checkRuleExists(rule);
            if (existsRules) throw new Error('rule is already exists');

            //   step 2 check exists all groups and get all minions from groups
            const promises = groups.map((group: number) => GroupModel.findOne({ where: { id: group }, include: [MinionModel] }));
            const handler = await Promise.all(promises);
            const minionsLoop = [];
            handler.forEach((handle, index: number) => {
                if (!handle) throw new Error(`groups with id ${groups[index]} not found`);
                if (!handle.dataValues.minions || !Array.isArray(handle.dataValues.minions)) return;
                minionsLoop.push(...handle.dataValues.minions);
            })
            const minions = minionsLoop.map((minionModel, index: number) => {
                return {
                    ...minionModel.dataValues,
                };
            });

            // step 3 get uniqueMinions
            const minionsUnique = ultis.uniqueSetArrayObject(minions, 'id');

            // step 4 exec cmd add rule bypass ssh
            const cmds = minionsUnique.map(minion => {
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

            // step 4 save rule and groups_rules
            const r = await RuleModel.create(rule);

            const handleCreate = groups.map(group => GroupRuleModel.create({ groupId: group, ruleId: r.id }))
            await Promise.all(handleCreate);

            return ultis.response(res, 200, r, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async deleteRule(req: express.Request, res: express.Response) {
        try {
            const { ruleId } = req.params;
            // step 1 check exists rule
            const exists: any = await RuleModel.findOne({ where: { id: ruleId, category: TypeOfRule.FIREWALL }, include: [{ model: GroupModel, include: [MinionModel] }] });
            if (!exists) throw new Error('Cannot find rule with id ' + ruleId);
            // step 2 get minons from groups
            const minions = [];
            exists.groups.forEach(group => {
                group.minions.forEach(minion => {
                    minions.push(minion.dataValues);
                })
            })
            const minionsUnique = ultis.uniqueSetArrayObject(minions, 'id');
            // step 3 create cmd delete rule and ssh execute
            const { name, chain, source, dports, protocol, action } = exists.dataValues;

            const rule: Rule = { name, chain, source, dports, protocol, action, category: TypeOfRule.FIREWALL };
            const cmds = minionsUnique.map(minion => {
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
                if (log.logs.result !== CodeExecCMDS.OK) {
                    if (log.logs.stdout.some(message => message.includes("Bad rule (does a matching rule exist in that chain?)"))) {
                        console.log("rule is not found in sensor, but we stile delete it from database");
                    } else {
                        throw new Error('exec cmd failed: ' + log.cmd);
                    }
                }
            })

            // step 3 remove rule
            exists.destroy();

            return ultis.response(res, 200, { logs, minionsUnique }, "delete success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async updateRule(req: express.Request, res: express.Response) {
        try {
            // step 1 check data request
            const { name, source, dports, protocol, action, description, tags = [] } = req.body;
            const { ruleId } = req.params;
            if (dports.some(p => !Number(p))) throw new Error('port must be number');

            // step 2 check exist rules 
            const exists = await RuleModel.findByPk(ruleId);
            if (!exists) throw new Error('Rule not found');

            // step 3 get all groups of rule
            const groupModel: any = await GroupRuleModel.findAll({ where: { ruleId: ruleId } });
            const groups = groupModel.map(group => group.groupId);
            // create new rule
            const rule: Rule = { name, chain: exists.chain, source, dports, protocol, action, description, category: TypeOfRule.FIREWALL, tags };

            const existsRules = await RuleService.checkRuleExists(rule);
            if (existsRules) throw new Error('rule is already exists with information');

            // step 4 check exists all groups and get all minions from groups
            const promises = groups.map((group: number) => GroupModel.findOne({ where: { id: group }, include: [MinionModel] }));
            const handler = await Promise.all(promises);
            const minionsLoop = [];
            handler.forEach((handle, index: number) => {
                if (!handle) throw new Error(`groups with id ${groups[index]} not found`);
                if (!handle.dataValues.minions || !Array.isArray(handle.dataValues.minions)) return;
                minionsLoop.push(...handle.dataValues.minions);
            })
            const minions = minionsLoop.map((minionModel, index: number) => {
                return {
                    ...minionModel.dataValues,
                };
            });

            // step 5 get uniqueMinions
            const minionsUnique = ultis.uniqueSetArrayObject(minions, 'id');

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

            return ultis.response(res, 200, exists, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new RuleController();