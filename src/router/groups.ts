import { GroupController_I } from "../controller";
import * as express from "express";
import { groupValidator } from "../ultis/validate";
import ultis from "../ultis/ultis";
const groupRouter = express.Router();

groupRouter.get('/', ultis.getPagination, GroupController_I.getGroups);
groupRouter.post('/', groupValidator.addGroup, GroupController_I.addGroup);
groupRouter.put('/:groupId/rules', groupValidator.changeRulesInGroup, GroupController_I.changeRulesIntoGroup);
groupRouter.put('/:groupId', groupValidator.updateGroup, GroupController_I.updateGroup);
groupRouter.delete('/:groupId', groupValidator.deleteGroup, GroupController_I.deleteGroup);


export default groupRouter;