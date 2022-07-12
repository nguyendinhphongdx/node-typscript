import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as express from 'express';

import ExecutorService from '../../exec-cmd/exec-ssh';
import ultis from '../ultis/ultis';
import { FileService, MinionService } from '../services';
import { Certs, CodeExecFile, MessageExecFile, RoleMinion, PathConfig, CodeExecCMD } from '../ultis/Constant';
import getConfig from '../../config';
import { Config } from 'types';
import { GroupRuleModel, MinionModel, RuleModel } from '../entities';
import GroupModel from '../entities/GroupModel';

const config: Config = getConfig('exec-so');
const path = 'data/';
class MinionController {
  async getMinions(req: express.Request, res: express.Response) {
    try {
      const { limit, offset, page, role } = req.query;
      const condition = {
        include: [{
          model: GroupModel,
          include: [RuleModel]
        }],
        limit: Number(limit), offset: Number(offset),
        where: {
          role: role + "",
        }
      }
      if (!page) {
        delete condition.limit;
        delete condition.offset;
      }
      if (!role) {
        delete condition.where;
      }
      const minions = await MinionModel.findAndCountAll(condition);
      const dataPageing = ultis.getPagingData(minions, page, limit);
      return ultis.response(res, 200, dataPageing, "success");
    } catch (error) {
      return ultis.response(res, 400, null, error.message || error);
    }
  }
  async applyFirewallForMinion(req: express.Request, res: express.Response) {

    const { minionName, groups, chain } = req.body;
    const pathRemote = config.path.minions + minionName;
    const pathLocal = `data/${new Date().getTime()}.sls`;
    try {
      // step 1 get file from remote server
      const resultDowload = await FileService.tranferDowloadFileSSH(pathLocal, pathRemote);
      if (resultDowload !== CodeExecFile.OK) throw new Error('Excetue dowload file from remote server failed');
      // step 2 append data to file system
      const parser = yaml.load(fs.readFileSync(pathLocal));

      const complierYaml = MinionService.compileFirewallYAML(parser, chain, groups);
      const yamlData = yaml.dump(complierYaml);

      const resultAppend = await FileService.writeFileYAML(pathLocal, yamlData);
      // const resultAppend = await FileService.appendFileLocal(pathLocal, data);

      if (resultAppend !== CodeExecFile.OK) throw new Error('Excetue append file from remote server failed');
      //  step 3 update file to remote server

      // const resultTranfer = await FileService.tranferUploadFileSSH(pathLocal, '/root/PhongND/master_manager.sls');
      // if (resultTranfer !== CodeExecFile.OK) throw new Error('Excetue tranfer file from local to remote server failed');
      // step 4 delete file created 
      // const resultDelete = await FileService.deleteFileLocal(pathLocal);
      // if (resultDelete !== CodeExecFile.OK) throw new Error('Execute delete file cloned failed');

      ultis.response(res, 200, null, MessageExecFile.OK);
    } catch (error) {
      ultis.response(res, 400, null, error.message || error);
    }
  }
  async syncMinions(req: express.Request, res: express.Response) {
    const resultMinions = [];
    try {
      const lsDir = MinionService.generateComnandGetMinions();
      const logs = await ExecutorService.execCmd(lsDir);
      if (logs.close[0].code != 0) {
        console.log(logs.stderr[0]);
        throw new Error(logs.stderr[0]);
      }
      const minions: string[] = ultis.parserLogExecute(logs);
      fs.writeFileSync(path + 'minions.yaml', minions.join("\r\n"), "binary");

      const multiCatMinion = minions.map((minionName: string) => MinionService.generateComnandReadMinions(minionName));

      const multiLogsCatMinion = await ExecutorService.execCmds(multiCatMinion);
      for (let index = 0; index < multiLogsCatMinion.length; index++) {
        const minionName = minions[index];
        const pathClone = path + minionName;
        const minionData = ultis.parserLogExecute(multiLogsCatMinion[index].logs);
        fs.writeFileSync(pathClone, minionData.join("\r\n"), "binary");
        const parser = yaml.load(fs.readFileSync(pathClone, 'utf8'));

        const splitName = ultis.spliteHostNameMinion(minionName);
        const entity = {
          hostName: splitName.name,
          role: splitName.role,
          ipAddress: parser?.sensoroni?.node_address
        }
        resultMinions.push(entity);
        const exists = await MinionModel.findOne({ where: { hostName: entity.hostName, role: entity.role } });
        if (exists) {
          console.log(entity.hostName + " updated");

          MinionModel.update({ hostName: entity.hostName, role: entity.role, ipAddress: entity.ipAddress }, { where: { id: exists.id } });
        } else {
          const created = await MinionModel.create(entity);
          console.log(entity.hostName + " created");
        }
        // minion.save();
      }
      if (!req) return resultMinions;
      return ultis.response(res, 200, resultMinions, "success");
    } catch (error) {
      if (!req) {
        console.log(error.message || error);
        return null;
      }
      return ultis.response(res, 400, null, error.message || error);
    }
  }
  async syncCertsSensors(req: express.Request, res: express.Response) {
    try {
      const sensors = await MinionModel.findAll({
        where: {
          role: RoleMinion.Sensor
        }
      });
      for (let index = 0; index < sensors.length; index++) {
        const sensor = sensors[index];
        const readCerts = MinionService.generateComnandsReadCertsSensor(sensor);
        const cmds = [{
          fileName: Certs.CA,
          cmd: readCerts.ca_cert
        }, {
          fileName: Certs.CLIENT_CERT,
          cmd: readCerts.client_cert
        }, {
          fileName: Certs.CLIENT_KEY,
          cmd: readCerts.client_key
        }];

        const logs = await ExecutorService.execCmds(cmds.map(item => item.cmd));
        for (let index = 0; index < cmds.length; index++) {
          if (logs[index].logs.close[0].code == CodeExecCMD.OK) {
            const certData = ultis.parserLogExecute(logs[index].logs);
            certData.shift();
            fs.writeFileSync(PathConfig.pathCerts + cmds[index].fileName + '_' + sensor.hostName + '.pem', certData.map(r => r.substring(4, r.length)).join("\r\n"), "binary");
          }
        }
      }
      if (!res) return sensors;
      return ultis.response(res, 200, sensors, "success");
    } catch (error) {
      if (!req) {
        console.log(error.message || error);
        return null;
      }
      return ultis.response(res, 400, null, error.message || error);
    }
  }
  async GetCertsSensor(req: express.Request, res: express.Response) {
    try {
      const { sensorName } = req.params;
      const exists = await MinionModel.findOne({ where: { hostName: sensorName + '', role: RoleMinion.Sensor } });
      if (!exists) throw new Error('sensor not found');
      const fileTypes = [Certs.CA, Certs.CLIENT_CERT, Certs.CLIENT_KEY];
      const result = {};
      fileTypes.map((type) => {
        const path = PathConfig.pathCerts + type + '_' + sensorName + '.pem';
        if (fs.existsSync(path)) {
          result[type] =fs.readFileSync(path);
        }
      });
      if (!res) return exists;
      return ultis.response(res, 200, result, "success");
    } catch (error) {
      if (!req) {
        console.log(error.message || error);
        return null;
      }
      return ultis.response(res, 400, null, error.message || error);
    }
  }
}
export default new MinionController();