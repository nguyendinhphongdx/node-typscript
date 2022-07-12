
import * as fs from 'fs';
import { CodeExecFile, PathConfig } from '../ultis/Constant';

import ExecutorService from '../../exec-cmd/exec-ssh';
import ultis from '../ultis/ultis';
import e = require('express');

class FileService {
    tranferUploadFileSSH(pathFileLocal: string, pathFileRemote: string): Promise<number> {
        return ExecutorService.tranferPutFile(pathFileLocal, pathFileRemote);
    }
    tranferDowloadFileSSH(pathFileLocal: string, pathFileRemote: string): Promise<number> {
        return ExecutorService.tranferGetFile(pathFileLocal, pathFileRemote);
    }
    appendFileLocal(pathFileLocal: string, data: string | Uint8Array): Promise<number> {
        return new Promise((resolve, reject) => {
            try {
                var stream = fs.createWriteStream(pathFileLocal, { flags: 'a' });
                console.log(new Date().toISOString());
                stream.write('\n');
                stream.write(data);
                console.log(new Date().toISOString());
                stream.end();
                resolve(CodeExecFile.OK);
            } catch (error) {
                reject(error);
            }
        })

    }
    deleteFileLocal(pathFileLocal: string): Promise<number> {
        return new Promise((resolve, reject) => {
            try {
                fs.unlinkSync(pathFileLocal);
                resolve(CodeExecFile.OK);
            } catch (error) {
                reject(error);
            }
        })
    }
    writeFileYAML(pathFile: string, data: string | NodeJS.ArrayBufferView) {
        return new Promise((resolve, reject) => {
            try {
                fs.writeFileSync(pathFile, data, "binary");
                resolve(CodeExecFile.OK);
            } catch (error) {
                reject(error);
            }
        })
    }
    generateFileAction(index: string, action: 'delete' | 'close' | 'warm', sector: string = 'index_settings', fileName: string): Promise<number> {
        const path = PathConfig.pathTemplate + `template-${action}.yaml`;
        return new Promise((resolve, reject) => {
            try {
                if(!fs.existsSync(PathConfig.pathTemplateCopyAction + fileName)){
                    const buffer = fs.readFileSync(path);
                    const dataString = ultis.replaceTemplateActionFile(buffer.toString('utf8'), sector, action, index);
                    fs.writeFileSync(PathConfig.pathTemplateCopyAction + fileName, dataString);
                }
                resolve(CodeExecFile.OK);
            } catch (error) {
                reject(error);
            }
        })
    }
    checkConfigExistsOrAppend(stringData: string, config: string, path: string) {
        if (stringData.includes(config)) return true;
        else {
            stringData += '\n' + config;
            fs.writeFileSync(path, stringData);
            return stringData;
        }
    }
}
export default new FileService();