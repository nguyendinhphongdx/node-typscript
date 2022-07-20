import { ViewController } from "../controller";
import * as express from "express";

const viewRouter = express.Router();

viewRouter.get('/app', ViewController.index);
viewRouter.get('/rule', ViewController.rules);

export default viewRouter;