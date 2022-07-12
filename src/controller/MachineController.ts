
import * as express from 'express';

import ultis from '../ultis/ultis';
import { LogSourceModel, MachineModel, MinionModel, RuleLogModel, RuleModel } from '../entities';
import getConfig from '../../config';
import { AppConfig } from '../types/config';
import { MachineState } from 'types';
import LogSourceController from './LogSourceController';
const appConfig: AppConfig = getConfig('app');

class MachineController {
    async getMachines(req: express.Request, res: express.Response) {
        try {
            const { limit, offset, page } = req.query;
            const condition =  {
                // include: {
                //     model: LogSourceModel,
                //     include: [RuleLogModel]
                // },
                limit: Number(limit), offset: Number(offset)
            }
            if(!page){
                delete condition.limit;
                delete condition.offset;
              }
            const groups = await MachineModel.findAndCountAll(condition);
            const dataPageing = ultis.getPagingData(groups, page, limit);
            return ultis.response(res, 200, dataPageing, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async addMachine(req: express.Request, res: express.Response) {
        try {
            const { name, ip, location, mac, description } = req.body;
            const machine: MachineState = { name, ip, location, mac, description };
            const machineModel = await MachineModel.create(machine);
            return ultis.response(res, 200, machineModel, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async updateMachine(req: express.Request, res: express.Response) {
        try {
            const { name, ip, location, mac, description } = req.body;
            const { machineId } = req.params;
            const machine: MachineState = { name, ip, location, mac, description };
            const exists = await MachineModel.findOne({ where: { id: machineId } });
            if (!exists) throw new Error('Machine not found');
            exists.update(machine);
            return ultis.response(res, 200, exists, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async deleteMachine(req: express.Request, res: express.Response) {
        try {
            const { machineId } = req.params;
            const exists: any = await MachineModel.findOne({
                where: { id: machineId },
                include: {
                    model: LogSourceModel
                },
            });
            if (!exists) throw new Error('Machine not found');

            const handler = exists.log_sources.map(logSource => {
                const req = {
                    params: {
                        sourceId: logSource.id
                    } 
                }
                return LogSourceController.deleteSource(req, null);
            })
            await Promise.all(handler);
            await exists.destroy();
            return ultis.response(res, 200, exists, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new MachineController();