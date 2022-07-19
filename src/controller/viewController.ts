import { OnionModel } from "../entities";
import * as express from "express";
import ultis from "../ultis/ultis";
class ViewController{
    async index(req: express.Request, res: express.Response) {
        try {
            const onions = await OnionModel.findAll();
            res.render('index', { title: 'Version Onion', onions });
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new ViewController();