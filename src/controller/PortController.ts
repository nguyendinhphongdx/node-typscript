import * as fs from 'fs';
import * as yaml from 'js-yaml';
import ExecutorService from '../../exec-cmd/exec-ssh';
import getConfig from '../../config';
import ultis from '../ultis/ultis';
import { Config } from 'types';
const config:Config = getConfig('exec-so');
const path = 'data/portgroups.local.yaml';

class PortController {
    async getPorts(req, res) {
        try {
            const logs = await ExecutorService.execCmd(config.cmd.portgroup);
            const data = logs.stdout.map((log: string) => {
                if (log.startsWith("#\t")) {
                    return log.replace("#\t", '#        ');
                }
                return log;
            })
            fs.writeFileSync(path, data.join("\r\n"), "binary");
            const doc = yaml.load(fs.readFileSync(path, 'utf8'));
            return ultis.response(res, 200, doc, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new PortController();