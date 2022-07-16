
import * as express from 'express';
import * as fs from 'fs';
import { Op } from 'sequelize';

import ultis from '../ultis/ultis';

import { OnionModel } from '../entities';
import { OnionProps } from 'types';
import { OnionService } from '../services';
class OnionController {
    block: boolean;
    constructor() {
        this.block = false;
    }
    async getUploadedOnion(req: express.Request, res: express.Response) {
        try {
            const { limit, offset, page, producer } = req.query;
            const condition = {
                where: {
                    producer: producer + ''
                },
                limit: Number(limit), offset: Number(offset)
            }
            if (!page) {
                delete condition.offset;
                delete condition.limit;
            }
            if(!producer){
                delete condition.where;
            }
            const rules = await OnionModel.findAndCountAll(condition);
            const dataPageing = ultis.getPagingData(rules, page, limit);
            return ultis.response(res, 200, dataPageing, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async uploadOnion(req: express.Request, res: express.Response) {
        const { files } = req;
        try {
            const onion: OnionProps = {
                nameVersion: req.body.nameVersion,
                description: req.body.description,
                version: req.body.version,
                path: files[0].path,
                fileType: files[0].mimetype,
                size: files[0].size,
                producer: req.body.producer,
            }
            const created = await OnionService.createRecord(onion);
            return ultis.response(res, 200, created, "success");
        } catch (error) {
            fs.existsSync(files[0].path) && fs.unlinkSync(files[0].path);
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async downloadOnion(req: express.Request, res: express.Response) {
        try {
            const { onionId } = req.params;
            const onion = await OnionModel.findOne({ where: { id: onionId } });
            if(!onion) throw new Error('onion not found');
            if (fs.existsSync(onion.path)) {
                const buffer = fs.readFileSync(onion.path);
                res.writeHead(200, {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": "attachment; filename=" + onion.nameVersion+'.zip',
                    // "Content-Length": stat.size
                });
                res.write(buffer);
                res.end();
            } else {
                throw new Error('file is not exists');
            }
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async updateOnion(req: express.Request, res: express.Response) {
        try {
            const { onionId } = req.params;
            const onion = await OnionModel.findOne({ where: { id: onionId } });
            if (!onion) throw new Error('onion not found');
            const { nameVersion, version } = req.body;
            const exists = await OnionModel.findOne({
                where: {
                    nameVersion, version, id: {
                        [Op.not]: onion.id
                    }
                }
            });
            if (exists) throw new Error('onion is already exists');
            const result = await onion.update({
                nameVersion: req.body.nameVersion,
                version: req.body.version,
                description: req.body.description,
                producer: req.body.producer,
            });
            return ultis.response(res, 200, result, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async deleteOnion(req: express.Request, res: express.Response) {
        try {
            const { onionId } = req.params;
            const onion = await OnionModel.findOne({ where: { id: onionId } });
            if (!onion) throw new Error('onion not found');
            fs.existsSync(onion.path) && fs.unlinkSync(onion.path);
            const result = await onion.destroy();
            return ultis.response(res, 200, result, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new OnionController();