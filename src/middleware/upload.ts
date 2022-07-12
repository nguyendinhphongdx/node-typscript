import * as multer from 'multer';
import * as express from 'express';
import * as path from "path";
import * as fs from "fs";
import { checkPathExisted } from '../../config';

const pathUpload = `${process.cwd()}/public`;
var storage = multer.diskStorage({
    destination: (req: express.Request, file: Express.Multer.File, callback) => {
        if (!checkPathExisted(pathUpload)) {
            fs.mkdirSync(pathUpload);
        }
        callback(null, pathUpload);
    },
    filename: (req, file: Express.Multer.File, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });
export default upload;