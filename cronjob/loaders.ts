import CronService from '.';
import { ConfigCollector, CronData } from '../src/types';
import { cronIds } from '../src/ultis/Constant';
import { CollectorController } from '../src/controller';
import getConfig from '../config';
const config: ConfigCollector = getConfig('collector');
class CronLoader {
    checkConnect() {
               
        const dataOptions: CronData = {
            id: cronIds.connectSensor,
            name: cronIds.connectSensor,
            schedule: config.schedule,
            status: true
        }
        CronService.addJob(dataOptions, CollectorController.intervalCheckConnectSensors);
    }
    init() {
        this.checkConnect();
    }
}
export default new CronLoader();