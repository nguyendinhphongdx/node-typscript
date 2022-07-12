import { HostControllerF } from "../controller";
import * as express from "express";
import validator from "../ultis/validate";
const hostRouter = express.Router();

hostRouter.get('/exec', HostControllerF.getHosts);
hostRouter.post('/exclude', validator.excludeHost, HostControllerF.excludeHost);
hostRouter.post('/include', validator.includeHost, HostControllerF.includeHost);
hostRouter.post('/add', validator.addHostGroup, HostControllerF.addHostGroup);



export default hostRouter;