
import * as express from 'express';
import * as fs from 'fs';
import ultis from '../ultis/ultis';
import { UserService } from '../services';
class UserController {
    constructor() {
    }
    async getUsers(req: express.Request, res: express.Response) {
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
            if (!producer) {
                delete condition.where;
            }
            const users = await UserService.getUsers(condition);
            const dataPageing = ultis.getPagingData({ rows: users, count: users.count }, Number(page), Number(limit));
            return ultis.response(res, 200, dataPageing, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }

    async createUser(req: express.Request, res: express.Response) {
        const { email, password } = req.body;
        try {
            const created = await UserService.createUser(email, password);
            return ultis.response(res, 200, created, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }

    async uploadUser(req: express.Request, res: express.Response) {
        const { files } = req;
        try {
            // const rule: RuleProps = {
            //     path: files[0].path,
            //     fileType: files[0].mimetype,
            //     size: files[0].size,
            // }
            // const created = await RuleService.createRecord(rule);
            return ultis.response(res, 200, {}, "success");
        } catch (error) {
            fs.existsSync(files[0].path) && fs.unlinkSync(files[0].path);
            return ultis.response(res, 400, null, error.message || error);
        }
    }

    async downloadUser(req: express.Request, res: express.Response) {
        try {
            const { userId } = req.params;
            // const user = await UserModel.findOne({ where: { id: userId } });
            // if (!user) throw new Error('user not found');
            // if (fs.existsSync(user.path)) {
            //     const buffer = fs.readFileSync(user.path);
            //     const fileName = user.ruleName;
            //     console.log('download file: ' + fileName);
            //     res.writeHead(200, {
            //         "Content-Type": "application/octet-stream",
            //         "Content-Disposition": "attachment; filename=" + fileName,
            //     });
            //     res.write(buffer);
            //     res.end();
            // } else {
            //     throw new Error('file is not exists');
            // }
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }

    async updateUser(req: express.Request, res: express.Response) {
        try {
            const { userId } = req.params;
            const result = await UserService.updateUser({
                id: Number(userId),
                email: 'user@example.com',
                active: false,
                password: '',
                role: 'admin',
            });
            return ultis.response(res, 200, result, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async deleteUser(req: express.Request, res: express.Response) {
        try {
            const { userId } = req.params;
            const user = await UserService.deleteUser(Number(userId));
            return ultis.response(res, 200, user, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new UserController();