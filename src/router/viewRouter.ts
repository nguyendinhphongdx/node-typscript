import { ViewController } from "../controller";
import * as express from "express";

const viewRouter = express.Router();

viewRouter.get('/', ViewController.index);

export default viewRouter;