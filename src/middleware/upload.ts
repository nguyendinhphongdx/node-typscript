import * as multer from 'multer';
import * as express from 'express';
import * as path from "path";
import * as fs from "fs";
import { checkPathExisted } from '../../config';
import { pathUpload } from '../ultis/Constant';

var storage = multer.diskStorage({
    filename: (req: express.Request, file: Express.Multer.File, cb) => {
        const fileTypes = getFileTypeUpload(req.baseUrl);
        if (!fileTypes) return cb(new Error('router with file type is not available'), null);

        if (!fileTypes.includes(file.mimetype)) {
            return cb(new Error(`file must be ` + fileTypes.join(' or ')), null);
        }
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    },
    destination: (req: express.Request, file: Express.Multer.File, callback) => {
        const pathUpload = getPathUpload(req.baseUrl);
        if (!checkPathExisted(pathUpload)) {
            fs.mkdirSync(pathUpload);
        }
        callback(null, pathUpload);
    }
});
const getPathUpload = (url: string) => {
    if (url.includes('/rules')) return pathUpload.rule;
    if (url.includes('/grafana')) return pathUpload.grafana;
    if (url.includes('/onion')) return pathUpload.onion;
    return process.cwd() + "/public";
}
const getFileTypeUpload = (url: string) => {
    if (url.includes('/rules')) return ['text/yaml','application/octet-stream'];
    if (url.includes('/grafana')) return ['application/zip','application/x-zip-compressed'];
    if (url.includes('/onion')) return ['application/zip','application/x-zip-compressed'];
    return null;
}
const upload = multer({ storage: storage });
export default upload;