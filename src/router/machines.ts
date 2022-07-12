import { MachineController } from "../controller";
import * as express from "express";
import validator, { machineValidator, ruleValidator } from "../ultis/validate";
import ultis from "../ultis/ultis";
const machineRouter = express.Router();

machineRouter.get('/', ultis.getPagination, MachineController.getMachines);
machineRouter.post('/', machineValidator.addMachine, MachineController.addMachine);
machineRouter.put('/:machineId', machineValidator.updateMachine, MachineController.updateMachine);
machineRouter.delete('/:machineId', machineValidator.deleteMachine, MachineController.deleteMachine);


export default machineRouter;