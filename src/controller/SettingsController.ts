import * as express from "express";
import getConfig from "../../config";
import ultis from "../ultis/ultis";
const settings = getConfig('rule');
class SettingsController {
    async getSettings(req: express.Request, res: express.Response) {
        try {
            ultis.response(res, 200, settings, "success");
        } catch (error) {
            return ultis.response(res, 400, null, error.message || error);
        }
    }
}
export default new SettingsController();