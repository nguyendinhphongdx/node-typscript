import * as multer from 'multer';
import * as express from 'express';
import * as path from "path";
import * as fs from "fs";
import { checkPathExisted } from '../../config';

var storage = multer.diskStorage({
    filename: (req: express.Request, file: Express.Multer.File, cb) => {
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
    return process.cwd() + "/public";
}
const upload = multer({ storage: storage });
export default upload;