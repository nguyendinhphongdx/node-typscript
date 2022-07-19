import * as express from "express";
import ultis from "../ultis/ultis";
import { OnionController } from "../controller";
import upload from "../middleware/upload";
import { validatorOnion } from "../ultis/validate";

const onionRouter = express.Router();

onionRouter.get('/', ultis.getPagination, OnionController.getUploadedOnion);
onionRouter.post('/upload', upload.array('attachment', 1), validatorOnion.uploadOnion, OnionController.uploadOnion);
onionRouter.get('/upload',(req, res) => {
    res.redirect('/update-center');
});

onionRouter.patch('/:onionId', validatorOnion.downloadOnion, OnionController.downloadOnion);
onionRouter.put('/:onionId', validatorOnion.updateOnion, OnionController.updateOnion);
onionRouter.delete('/:onionId', validatorOnion.deleteOnion, OnionController.deleteOnion);


export default onionRouter;