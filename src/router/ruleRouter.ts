import * as express from "express";
import ultis from "../ultis/ultis";
import { RuleController } from "../controller";

const collectorRouter = express.Router();

collectorRouter.get('/',ultis.getPagination, RuleController.getCollectors);




export default collectorRouter;