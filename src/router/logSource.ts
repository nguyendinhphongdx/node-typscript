import { LogSourceController } from "../controller";
import * as express from "express";
import validator, { logSourceValidator } from "../ultis/validate";
import ultis from "../ultis/ultis";
const logSourceRouter = express.Router();

logSourceRouter.get('/', ultis.getPagination, LogSourceController.getLogSources);
logSourceRouter.post('/', logSourceValidator.addSource, LogSourceController.addLogSource);
logSourceRouter.put('/:sourceId', logSourceValidator.updateSource, LogSourceController.updateSource);
logSourceRouter.delete('/:sourceId', logSourceValidator.deleteSource, LogSourceController.deleteSource);

export default logSourceRouter;