
import { AppConfig } from 'types';
import * as express from "express";
import userRouter from './userRouter';
import viewRouter from './viewRouter';
import getConfig from '../../config';

const config: AppConfig = getConfig('app');
class RouterServer {
    init(app: express.Application) {
        app.use(`${config.subDomain}/users`, userRouter);
        app.use(`${config.subDomain}/views`, viewRouter);
    }
}
export default new RouterServer();