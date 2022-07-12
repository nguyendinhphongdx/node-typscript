import { SettingController } from "../controller";
import * as express from "express";
const settingsRouter = express.Router();

settingsRouter.get('/', SettingController.getSettings);

export default settingsRouter;