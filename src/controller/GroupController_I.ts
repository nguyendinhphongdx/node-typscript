
import * as express from 'express';

import ultis from '../ultis/ultis';
import { GroupModel, GroupRuleModel, MinionGroupModel, MinionModel, RuleModel } from '../entities';
import { ModelService, RuleService } from '../services';
import getConfig from '../../config';
import { AppConfig } from '../types/config';
import { CodeExecCMDS } from '../ultis/Constant';
const appConfig: AppConfig = getConfig('app');

class GroupController {
    async getGroups(req: express.Request, res: express.Response) {
        try {
            const { limit, offset, page } = req.query;
            const condition =  {
                include:
                    [{
                        model: RuleModel
                    }, {
                        model: MinionModel
                    }],
                limit: Number(limit), offset: Number(offset)
            }
            if (!page) {
                delete condition.limit;
                delete condition.offset;
            }
            const groups = await GroupModel.findAndCountAll(condition);
            const dataPageing = ultis.getPagingData(groups, page, limit);
            return ultis.response(res, 200, dataPageing, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async addGroup(req: express.Request, res: express.Response) {
        try {
            const { groupName, minionsId, description } = req.body;
            // step 1 check minionsId is array
            if (!minionsId || !Array.isArray(minionsId)) throw new Error("minionsId is not array");

            // step 2 check minionid is exist

            for (let index = 0; index < minionsId.length; index++) {
                const minionId = minionsId[index];
                const existsMinion = await MinionModel.findOne({ where: { id: minionId } });
                if (!existsMinion) throw new Error(`Minion with id ${minionId} does not exist`);
            }
            // step 3 save group

            const group: any = await GroupModel.create({ groupName: groupName, description: description });
            // await group.save();

            // step 4 save multi minions_groups

            const promises = minionsId.map((minionId) => {
                return MinionGroupModel.create({
                    minionId: minionId,
                    groupId: group.dataValues.id
                });

            })
            await Promise.all(promises);

            return ultis.response(res, 200, group, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async updateGroup(req: express.Request, res: express.Response) {
        try {
            const { groupName, minionsId, description } = req.body;
            const { groupId } = req.params;
            // step 1 check group exist
            const exists: any = await GroupModel.findOne({ where: { id: groupId }, include: [MinionModel] });
            if (!exists) throw new Error(`Cant not find group with id ${groupId}`);
            // step 2 update group
            exists.update({ groupName: groupName, description: description });
            // step 3 update references group
            const minions = exists.dataValues?.minions || [];

            const minionsIdOld = minions.map(minions => minions.id);
            const handler = await ModelService.updateIntermediateTable(minionsIdOld, minionsId, MinionGroupModel, exists.dataValues.id, {
                keySideOne: 'groupId',
                keySideMany: 'minionId'
            });
            const groups = await GroupModel.findAll({ where: { id: groupId }, include: [RuleModel] });
            return ultis.response(res, 200, groups, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async deleteGroup(req: express.Request, res: express.Response) {
        try {
            const { groupId } = req.params;
            const { forceRef } = req.body;
            // step 1 check group exist
            const exists: any = await GroupModel.findOne({ where: { id: groupId }, include: [MinionModel, RuleModel] });
            if (!exists) throw new Error(`Cant not find group with id ${groupId}`);
            // step 2 delete references group with minions

            // const minions = exists.dataValues?.minions || [];
            // const minionsIdOld = minions.map(minion => minion.id);

            // await ModelService.deleteIntermediateTable(
            //     MinionGroupModel,
            //     minionsIdOld,
            //     exists.dataValues.id,
            //     {
            //         keySideMany: "minionId",
            //         keySideOne: "groupId"
            //     });
            // step 3 delete references group with rules

            // const rules = exists.dataValues?.rules || [];
            // const rulesId = rules.map(rule => rule.id);

            // await ModelService.deleteIntermediateTable(
            //     GroupRuleModel,
            //     rulesId,
            //     exists.dataValues.id,
            //     {
            //         keySideMany: "ruleId",
            //         keySideOne: "groupId"
            //     });

            if (forceRef) {
                console.log('deleting... rule reference with group', exists.groupName);
                const rules = exists.rules || [];
                const rulesId = rules.map(rule => rule.id);

                // delete in iptables
                const cmds = [];
                for (let index = 0; index < exists.minions.length; index++) {
                    const minion = exists.minions[index];
                    rules.forEach(rule => {
                        let cmd = '';
                        if (minion.hostName !== appConfig.deployOnMinion) {
                            cmd = RuleService.generateComnandRemoveRuleWithMinion(rule, minion);
                        } else {
                            cmd = RuleService.generateComnandRemoveRule(rule);
                        }
                        if (!cmd) throw new Error(`generate command delete rule failed`);
                        cmds.push(cmd);
                    })
                }
                const logs = await RuleService.execMultiCommandSSH(cmds);
                logs.forEach(log => {
                    if (log.logs.result !== CodeExecCMDS.OK) throw new Error('exec cmd failed: ' + log.cmd);
                })
                // delete in database
                const handleDelete = rulesId.map(rule => {
                    return RuleModel.destroy({ where: { id: rule } });
                })
                await Promise.all(handleDelete);
            }
            // step 4 delete groups
            await exists.destroy();
            const groups = await GroupModel.findAll();

            return ultis.response(res, 200, groups, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async changeRulesIntoGroup(req: express.Request, res: express.Response) {
        try {
            const { groupId } = req.params;
            const { rulesId } = req.body;

            // step 1 check groups exist 
            const exists: any = await GroupModel.findOne({ where: { id: groupId }, include: [RuleModel, MinionModel] });
            if (!exists) throw new Error(`Cant not find group with id ${groupId}`);

            // step 2 check  rulesId exists   
            const promises = rulesId.map((ruleId: number) => RuleModel.findOne({ where: { id: ruleId } }));
            const anyNotExists = await Promise.all(promises);
            anyNotExists.forEach((ex, index: number) => {
                if (!ex) throw new Error(`Rule with id ${rulesId[index]} not found`);
            })

            const rules = exists.dataValues.rules;
            const rulesIdOld = rules.map(rule => rule.id);

            // step 3 add rule in minion or remove rule from minions
            const { plus, sub } = ultis.differentTwoArray(rulesIdOld, rulesId);
            if (plus.length == 0 && sub.length == 0) throw new Error('Old Rules and New Rules are the same');
            const minionsModel = exists.dataValues?.minions || [];
            const minions = minionsModel.map(minion => minion.dataValues);

            // step 3.1 add new rules to minions
            const handleAddRemove: string[] = [];
            for (let index = 0; index < minions.length; index++) {
                const minion = minions[index];
                for (let index = 0; index < plus.length; index++) {
                    const rule = anyNotExists.find(item => item.dataValues.id === plus[index]);
                    if (!rule) continue;
                    let cmd = '';
                    if (minion.hostName !== appConfig.deployOnMinion) {
                        cmd = RuleService.generateComnandAddRuleWithMinion(rule, minion);
                    } else {
                        cmd = RuleService.generateComnandAddRule(rule);
                    }
                    if (!cmd) throw new Error(`generate command add rule failed`);
                    handleAddRemove.push(cmd);
                }
                for (let index = 0; index < sub.length; index++) {
                    const rule = await RuleModel.findByPk(sub[index]);
                    if (!rule) continue;
                    let cmd = '';
                    if (minion.hostName !== appConfig.deployOnMinion) {
                        cmd = RuleService.generateComnandRemoveRuleWithMinion(rule, minion);
                    } else {
                        cmd = RuleService.generateComnandRemoveRule(rule);
                    }
                    if (!cmd) throw new Error(`generate command delete rule failed`);
                    handleAddRemove.push(cmd);
                }
            }

            const logs = await RuleService.execMultiCommandSSH(handleAddRemove);
            logs.forEach(log => {
                if (log.logs.result !== CodeExecCMDS.OK) throw new Error('exec cmd failed: ' + log.cmd);
            })
            // step 4 update differentTwoArray rules in groups_rules 

            const handler = await ModelService.updateIntermediateTable(rulesIdOld, rulesId, GroupRuleModel, exists.dataValues.id, {
                keySideOne: 'groupId',
                keySideMany: 'ruleId'
            });

            const groups = await GroupModel.findAll({ where: { id: groupId }, include: [RuleModel] });

            return ultis.response(res, 200, groups, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new GroupController();