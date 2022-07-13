import * as express from "express";
import ultis from "../ultis/ultis";
import { GrafanaController } from "../controller";
import upload from "../middleware/upload";
import { validatorGrafana } from "../ultis/validate";

const grafanaRouter = express.Router();

grafanaRouter.get('/', ultis.getPagination, GrafanaController.getUploadedGrafana);
grafanaRouter.post('/upload', upload.array('attachment', 1), validatorGrafana.uploadGrafana, GrafanaController.uploadGrafana);
grafanaRouter.patch('/:grafanaId', validatorGrafana.downloadGrafana, GrafanaController.downloadGrafana);


export default grafanaRouter;