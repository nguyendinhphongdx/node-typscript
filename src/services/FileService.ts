
import * as fs from 'fs';
import { CodeExecFile } from '../ultis/Constant';

class FileService {
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
}
export default new FileService();