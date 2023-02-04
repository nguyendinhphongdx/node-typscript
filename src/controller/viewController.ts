import { UserModel } from "../entities";
import * as express from "express";
import ultis from "../ultis/ultis";
class ViewController {
    async index(req: express.Request, res: express.Response) {
        try {
            const onions = [];
            const grafanas = [];
            const versions = [];
            onions.forEach((o: any) => {
                versions.push({
                    ...o.dataValues,
                    type: 'onion'
                });
            })
            grafanas.forEach((g: any) => {
                versions.push({
                    ...g.dataValues,
                    type: 'grafana'
                })
            })
            res.render('index', { title: 'Version Application', versions });
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
    async rules(req: express.Request, res: express.Response) {
        try {
            const users = await UserModel.findAll();
            res.render('users', { title: 'Version Rules', users });
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new ViewController();