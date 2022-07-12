
import * as express from 'express';
import ultis from '../ultis/ultis';

import { MinionModel, CollectorModel } from '../entities';
import { CodeRequestAgent, RoleMinion } from '../ultis/Constant';
import { ModelService, CollectorService } from '../services';
import { Collector, ResponseErrorAgent, ResponseSuccessAgent } from 'types';

class CollectorController {
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
    async intervalCheckConnectSensors() {
        try {
            const sensors = await MinionModel.findAll({
                where: {
                    role: RoleMinion.Sensor
                }
            });
            const fileBeatAPIs = []; const logstashAPIs = [];
            sensors.forEach((sensor) => {
                fileBeatAPIs.push(CollectorService.requestFileBeat(sensor.ipAddress));
                logstashAPIs.push(CollectorService.requestLogstash(sensor.ipAddress));
            })
            const handle: Array<ResponseSuccessAgent | ResponseErrorAgent> = await Promise.all([...fileBeatAPIs, ...logstashAPIs]);
            const handleFileBeat = fileBeatAPIs.map((_) => handle.shift());
            const handleLogstash = handle;

            console.log(handleFileBeat.length, handleLogstash.length);
            const handler = sensors.map(async (sensor, index) => {
                const { ipAddress, role, hostName } = sensor;
                const exists = await CollectorModel.findOne({ where: { ipAddress, hostName } });
                var fileBeat = {
                    reconnect: exists?.fileBeat?.reconnect || 0,
                    lastUpdate: new Date().toISOString(),
                    data: exists?.fileBeat?.data || null
                };

                if (handleFileBeat[index].code === CodeRequestAgent.OK) {
                    const newData = CollectorService.convertResponseFileBeat(handleFileBeat[index]);
                    fileBeat.data = newData || fileBeat.data;
                    fileBeat.reconnect = 0;
                }else{
                    ++ fileBeat.reconnect;
                }

                var logstash = {
                    reconnect: exists?.logstash?.reconnect || 0,
                    lastUpdate: new Date().toISOString(),
                    data: exists?.logstash?.data || null
                };

                if (handleLogstash[index].code === CodeRequestAgent.OK) {
                    const newData = CollectorService.convertResponseLogstash(handleLogstash[index]);
                    logstash.data = newData || logstash.data;
                    logstash.reconnect = 0;
                }else{
                    ++ logstash.reconnect;

                }
                const active = handleFileBeat[index].code === CodeRequestAgent.OK &&  handleLogstash[index].code === CodeRequestAgent.OK;
                return ModelService.createOrUpdate<Collector>(CollectorModel, { ipAddress, hostName }, {
                    ipAddress, role, hostName, fileBeat, logstash, active
                })
            });
            const result = await Promise.all(handler);
            console.log('====> check connect to sensors success');
            
            
        } catch (error) {
            console.log(error.message);

        }
    }

}
export default new CollectorController();