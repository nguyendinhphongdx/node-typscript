import * as express from "express";
import ultis from "../ultis/ultis";

import { MinionController } from "../controller";
import validator from "../ultis/validate";

const minionRouter = express.Router();

minionRouter.get('/', ultis.getPagination, MinionController.getMinions);
minionRouter.put('/apply', validator.applyFirewall, MinionController.applyFirewallForMinion);
minionRouter.get('/sync', MinionController.syncMinions);
minionRouter.get('/certs/:sensorName', validator.getCertsSensor, MinionController.GetCertsSensor);


export default minionRouter;