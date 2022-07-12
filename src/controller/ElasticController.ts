
import * as express from 'express';
import * as fs from 'fs';
import ultis from '../ultis/ultis';
import * as yaml from 'js-yaml';

import getConfig from '../../config';
import { Config, TypeConfigModel } from '../types/config';
import { DataSharingService, ElasticService, FileService } from '../services';
import { ConfigModel } from '../entities';
import ExecutorService from '../../exec-cmd/exec-ssh';
import { CodeExecCMD, CodeExecFile, KeyConfig, MessageConfig, PathConfig } from '../ultis/Constant';
const { pathGlobal, pathTemplate, pathTemplateCopyAction, pathTemplateCopyBin } = PathConfig;
const execConfig: Config = getConfig('exec-so');
const actions = ['close', 'delete', 'warm']

class ElasticController {
    block: boolean;
    constructor() {
        this.block = false;
    }
    async getLifeIndices(req: express.Request, res: express.Response) {

        try {

            const { length, data } = await DataSharingService.getIndexes();
            if (!data || !Array.isArray(data)) throw new Error('Get indices from datashring failure');
            const indices = [];
            data.forEach(item => {
                const names = item.index.split("-");
                if (item.index.startsWith('so-') && names.length === 3) {
                    delete names[2];
                    const sub = names.join("-").substring(0, names.join("-").length - 1);
                    if (!indices.includes(sub))
                        indices.push(sub);
                }
            })
            const global = await ConfigModel.findOne({ where: { key: KeyConfig.global } });

            if (!global && !global?.value?.elasticsearch) throw new Error(`config with ${KeyConfig.global} not found`);
            const { index_settings, index_custom_settings = {} } = global?.value?.elasticsearch;
            if (!index_settings) throw new Error(`value ${KeyConfig.global} not include index_settings`);

            const logManaged = { ...index_settings, ...index_custom_settings };
            let map = ElasticService.mapIndicesWithGlobal(indices, logManaged);
            if (!res) {
                return map;
            }
            let converted = [];
            map.managed.forEach((item) => {
                converted.push({
                    ...item,
                    status: true,
                });
            });
            map.notManaged.forEach((item) => {
                converted.push({
                    ...item,
                    status: false,
                });
            })
            const { limit, offset, page } = req.query;
            const pagging = {
                count: converted.length,
                rows: page ? converted.splice(Number(offset), Number(limit)) : converted
            }
            const result = ultis.getPagingData(pagging, page, limit);
            return ultis.response(res, 200, result, "success");
        } catch (error) {
            if (!res) throw error;
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async syncLifeIndices(req: express.Request, res: express.Response) {
        try {
            const handleSave = [];
            // check exist golbal mounted
            if (!fs.existsSync(pathGlobal)) throw new Error(pathGlobal + 'not found');

            //  check exist bin files mounted
            actions.forEach((action: "delete" | "close" | "warm", index) => {
                const pathFileBin = pathTemplateCopyBin + ElasticService.generateBinFileNames(action);
                if (!fs.existsSync(pathFileBin)) {
                    console.log(pathFileBin, "has'nt been mounted, template will be copied ", pathFileBin);
                    fs.copyFileSync(pathTemplate + "template-so-curator-cluster-" + action, pathFileBin);
                }
                handleSave.push(ElasticService.updateOrCreateConfigFromBash(pathFileBin, ultis.actionToKeyBinSave(action)));
            })
            handleSave.push(ElasticService.updateOrCreateConfigFromYAML(pathGlobal, KeyConfig.global));
            await Promise.all(handleSave);
            return handleSave;
        } catch (error) {
            console.error(error.message);
        }
    }
    async addManageLifeIndex(req: express.Request, res: express.Response) {

        try {
            const global = await ConfigModel.findOne({ where: { key: KeyConfig.global } });
            if (this.block) throw new Error(MessageConfig.globalInUse);
            this.block = true;

            // 1 get warm, close, delete from request
            const { warm, close, delete: _delete, index } = req.body;
            const handler = await this.getLifeIndices(null, null);
            if (!handler) throw new Error('Get life indices failed');
            const { managed, notManaged } = handler;
            managed.forEach(managed => {
                if (managed.key === index) throw new Error('index was managed life');
            })
            if (!notManaged.some(item => item.key === index)) throw new Error('index not found in index list');
            // generate 3 file action
            const actionFileNames = ElasticService.generateActionFileNames(index);

            const execFiles = Object.keys(actionFileNames).map((action: 'delete' | 'close' | 'warm', _index) => {
                return FileService.generateFileAction(index, action, "index_custom_settings", Object.values(actionFileNames)[_index]);
            })
            const handlerExecs = await Promise.all(execFiles);
            for (let index = 0; index < handlerExecs.length; index++) {
                if (handlerExecs[index] !== CodeExecFile.OK) throw new Error('Generate file actions failed');
            }
            // update docker file bin bash docker
            const [confClose, confDelete, confWarm] = await Promise.all([
                ConfigModel.findOne({ where: { key: KeyConfig.binClose } }),
                ConfigModel.findOne({ where: { key: KeyConfig.binDelete } }),
                ConfigModel.findOne({ where: { key: KeyConfig.binWarm } })
            ]);
            const configs = [
                {
                    fileName: actionFileNames.close,
                    config: confClose,
                }, {
                    fileName: actionFileNames.delete,
                    config: confDelete,
                }, {
                    fileName: actionFileNames.warm,
                    config: confWarm,
                }
            ];
            configs.forEach((item, _i) => {
                const dockerCMD = ElasticService.generateConfigBinDocker(item.fileName);
                const existsDockerConf = FileService.checkConfigExistsOrAppend(item.config.value, dockerCMD, item.config.path);
                if (typeof existsDockerConf === 'string') {
                    console.log('appendFileLocal success', item.config.path);
                    item.config.value = existsDockerConf;
                    item.config.save();
                }
            })
            // update golbal.sls

            if (!global.value.elasticsearch) throw new Error('elasticsearch is not available in global config');
            global.value.elasticsearch['index_custom_settings'][index] = {
                warm,
                close,
                delete: _delete,
            }
            const handleSave = await ConfigModel.update({ value: global.value }, { where: { key: KeyConfig.global } });
            const yamlData = yaml.dump(global.value);

            const resultAppend = await FileService.writeFileYAML(pathGlobal, yamlData);
            // restart curator
            const cmd = ElasticService.generateCMDRestartCurator();
            const log = await ExecutorService.execCmd(cmd);
            if (log.close[0].code != CodeExecCMD.OK) throw new Error('execute restart curator failed');
            this.block = false;
            return ultis.response(res, 200, global.value, "success");
        } catch (error) {
            if (error.message !== MessageConfig.globalInUse) {
                this.block = false;
            }
            return ultis.response(res, 400, null, error.message || error);
        }

    }
    async updateManageLifeIndex(req: express.Request, res: express.Response) {
        try {
            // 1 get warm, close, delete from request
            const { warm, close, delete: _delete, index } = req.body;
            const global = await ConfigModel.findOne({ where: { key: KeyConfig.global } });
            if (this.block) throw new Error(MessageConfig.globalInUse);
            this.block = true;

            await new Promise(r => setTimeout(r, 60000));
            const handler = await this.getLifeIndices(null, null);
            if (!handler) throw new Error('Get life indices failed');
            const { managed, notManaged } = handler;
            if (!managed.some(item => item.key === index)) throw new Error('index not found or not managed');
            // generate 3 file action if not yet exists

            if (!global.value.elasticsearch) throw new Error('elasticsearch is not available in global config');
            let sector = null;
            if (Object.keys(global.value.elasticsearch.index_custom_settings).includes(index)) sector = 'index_custom_settings';
            if (Object.keys(global.value.elasticsearch.index_settings).includes(index)) sector = 'index_settings';

            const actionFileNames = ElasticService.generateActionFileNames(index);

            const execFiles = Object.keys(actionFileNames).map((action: 'delete' | 'close' | 'warm', _index) => {
                return FileService.generateFileAction(index, action, sector, Object.values(actionFileNames)[_index]);
            });
            const handlerExecs = await Promise.all(execFiles);
            for (let index = 0; index < handlerExecs.length; index++) {
                if (handlerExecs[index] !== CodeExecFile.OK) throw new Error('Generate file actions failed');
            }
            // update docker file bin bash docker
            const [confClose, confDelete, confWarm] = await Promise.all([
                ConfigModel.findOne({ where: { key: KeyConfig.binClose } }),
                ConfigModel.findOne({ where: { key: KeyConfig.binDelete } }),
                ConfigModel.findOne({ where: { key: KeyConfig.binWarm } })
            ]);
            const configs = [
                {
                    fileName: actionFileNames.close,
                    config: confClose,
                }, {
                    fileName: actionFileNames.delete,
                    config: confDelete,
                }, {
                    fileName: actionFileNames.warm,
                    config: confWarm,
                }
            ];
            configs.forEach((item, _i) => {
                const dockerCMD = ElasticService.generateConfigBinDocker(item.fileName);
                const existsDockerConf = FileService.checkConfigExistsOrAppend(item.config.value, dockerCMD, item.config.path);
                if (typeof existsDockerConf === 'string') {
                    console.log('appendFileLocal success', item.config.path);
                    item.config.value = existsDockerConf;
                    item.config.save();
                }
            })
            // update golbal.sls

            global.value.elasticsearch[sector][index] = {
                warm,
                close,
                delete: _delete,
            }
            const handleSave = await ConfigModel.update({ value: global.value }, { where: { key: KeyConfig.global } });
            const yamlData = yaml.dump(global.value);

            const resultAppend = await FileService.writeFileYAML(pathGlobal, yamlData);
            // restart curator
            const cmd = ElasticService.generateCMDRestartCurator();
            const log = await ExecutorService.execCmd(cmd);
            if (log.close[0].code != CodeExecCMD.OK) throw new Error('execute restart curator failed');
            this.block = false;
            return ultis.response(res, 200, global.value, "success");
        } catch (error) {
            if (error.message !== MessageConfig.globalInUse) {
                this.block = false;
            }
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async getConfigGobal(req: express.Request, res: express.Response) {
        const global = await ConfigModel.findOne({ where: { key: KeyConfig.global } });
        return ultis.response(res, 200, global.value, "success");
    }
}
export default new ElasticController();