import { UserController } from "../controller";
import * as express from "express";
const userRouter = express.Router();

userRouter.get('/',UserController.getUsers);
userRouter.post('/',UserController.getUsers);


export default userRouter;