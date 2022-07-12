import * as express from "express";
import ultis from "../ultis/ultis";
import { ElasticController } from "../controller";
import { validatorLifeIndex } from "../ultis/validate";

const elasticRouter = express.Router();

elasticRouter.get('/life-indices',ultis.getPagination, ElasticController.getLifeIndices);
elasticRouter.post('/life-indices', validatorLifeIndex.addManageLifeIndex, ElasticController.addManageLifeIndex.bind(ElasticController));
elasticRouter.put('/life-indices', validatorLifeIndex.addManageLifeIndex, ElasticController.updateManageLifeIndex.bind(ElasticController));


elasticRouter.get('/life-indices/global', ElasticController.getConfigGobal);




export default elasticRouter;