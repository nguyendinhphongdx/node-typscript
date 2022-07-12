import * as fs from 'fs';
import * as yaml from 'js-yaml';
import getConfig from '../../config';
import { LifeLog, Config, TypeConfigModel } from "types";
import { ConfigModel } from "../entities";
const config: Config = getConfig("exec-so");
interface managed {
    key: string;
    value: any;
}
class ElasticService {
    mapIndicesWithGlobal(indices: string[], global: Record<string, LifeLog>) {
        const managed: managed[] = [], notManaged: managed[] = [];
        const logManaged = Object.keys(global);
        const values = Object.values(global);
        indices.forEach(index => {
            const findIndex = logManaged.findIndex(item => item === index);
            if (findIndex != -1) {
                const item = {
                    key: logManaged[findIndex],
                    value: values[findIndex]
                };
                managed.push(item);
            } else {
                notManaged.push({
                    key: index,
                    value: null
                });
            }
        })
        const keysManaged = managed.map(item => item.key);
        logManaged.forEach((manage, index) => {
            if (!keysManaged.includes(manage)) {
                managed.push({
                    key: manage,
                    value: values[index]
                })
            }
        })
        return { managed, notManaged };
    }
    generateActionFileNames(index: string) {
        return {
            delete: index + '-delete.yaml',
            close: index + '-close.yaml',
            warm: index + '-warm.yaml',
        }
    }
    generateBinFileNames(action: 'delete' | 'close' | 'warm') {
        return 'so-curator-cluster-' + action;
    }
    async updateOrCreateConfigFromYAML(path: string, key: string) {
        const result = yaml.load(fs.readFileSync(path, 'utf8'));
        const model: TypeConfigModel = {
            key: key,
            value: result,
            path,
            block: false
        }
        const config = await ConfigModel.findOne({ where: { key: model.key } });
        if (config) {
            return config.update(model);
        } else {
            return ConfigModel.create(model);
        }
    }
    async updateOrCreateConfigFromBash(path: string, key: string) {
        const result = fs.readFileSync(path, 'utf8');
        const model: TypeConfigModel = {
            key: key,
            value: result,
            path,
            block: false
        }
        const config = await ConfigModel.findOne({ where: { key: model.key } });
        if (config) {
            return config.update(model);
        } else {
            return ConfigModel.create(model);
        }
    }
    generateConfigBinDocker(fileName: string) {
        return `docker exec so-curator curator --config /etc/curator/config/curator.yml /etc/curator/action/${fileName} > /dev/null 2>&1;`
    }
    generateCMDRestartCurator(){
        return config.cmd.restartCurator;
    }
}
export default new ElasticService();