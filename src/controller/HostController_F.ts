import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as express from 'express';

import ExecutorService from '../../exec-cmd/exec-ssh';
import getConfig from '../../config';
import HostService from '../services/HostService';
const config: Config = getConfig('exec-so');
const path = 'data/hostgroups.local.yaml';
import ultis from '../ultis/ultis';
import { Config, Logs } from 'types';

class HostControllerF {
    async getHosts(req: express.Request, res: express.Response) {
        try {
            const logs:Logs = await ExecutorService.execCmd(config.cmd.hostgroup);
            const data: string[] = ultis.parserLogExecute(logs);
            fs.writeFileSync(path, data.join("\r\n"), "binary");
            const doc = yaml.load(fs.readFileSync(path, 'utf8'));
            return ultis.response(res, 200, doc, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async excludeHost(req: express.Request, res: express.Response) {
        try {
            const { hostGroup, ip } = req.body;
            const cmd = HostService.generateComnandExcludeHost(hostGroup, ip);
            const logs = await ExecutorService.execCmd(cmd);
            return ultis.response(res, 200, logs, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async addHostGroup(req: express.Request, res: express.Response) {
        try {
            const { hostGroupName } = req.body;
            const cmd = HostService.generateComnandAddHost(hostGroupName);
            const logs = await ExecutorService.execCmd(cmd);
            return ultis.response(res, 200, logs, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async includeHost(req: express.Request, res: express.Response) {
        try {
            const { hostGroup, ip } = req.body;
            const cmd = HostService.generateComnandIncludeHost(hostGroup, ip);
            const logs = await ExecutorService.execCmd(cmd);
            return ultis.response(res, 200, logs, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new HostControllerF();