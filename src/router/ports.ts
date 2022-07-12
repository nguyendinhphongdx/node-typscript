import { PortController } from "../controller";
import * as express from "express";
const portRouter = express.Router();

portRouter.get('/exec',PortController.getPorts);

export default portRouter;