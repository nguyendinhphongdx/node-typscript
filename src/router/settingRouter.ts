import { SettingsController } from "../controller";
import * as express from "express";

const settingRouter = express.Router();

settingRouter.get('/', SettingsController.getSettings);

export default settingRouter;