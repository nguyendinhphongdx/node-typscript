import * as express from "express";
import ultis from "../ultis/ultis";
import { UserController } from "../controller";
import upload from "../middleware/upload";
import { validatorUser } from "../ultis/validate";

const userRouter = express.Router();

userRouter.get('/', ultis.getPagination, UserController.getUsers);
// userRouter.post('/upload', upload.array('attachment', 1), validatorUser.uploadUser, UserController.uploadUser);
// userRouter.patch('/:userId', validatorUser.downloadUser, UserController.downloadUser);
userRouter.post('/create', validatorUser.createUser, UserController.createUser);
userRouter.put('/:userId', validatorUser.updateUser, UserController.updateUser);
userRouter.delete('/:userId', validatorUser.deleteUser, UserController.deleteUser);


export default userRouter;