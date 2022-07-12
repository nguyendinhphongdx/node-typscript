import * as express from 'express';
import * as fs from 'fs';
import ultis from '../ultis/ultis';
import getConfig from '../../config';
import { AppSetting } from '../types/config';
const settings:AppSetting = getConfig('settings');
class SettingController {
    getSettings(req: express.Request, res: express.Response) {
        ultis.response(res,200,settings,'success')
    }
}
export default new SettingController();