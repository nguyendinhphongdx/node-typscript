import * as express from "express";
import ultis from "../ultis/ultis";
import { CollectorController } from "../controller";

const collectorRouter = express.Router();

collectorRouter.get('/',ultis.getPagination, CollectorController.getCollectors);




export default collectorRouter;