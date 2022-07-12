import app from "./app";
import { connectMysql } from "../database";
import * as fs from 'fs';
import { CollectorController, ElasticController, MinionController } from "./controller";
import CronLoader from '../cronjob/loaders';
import getConfig from "../config";
import { AppConfig } from "types/config";
const config: AppConfig = getConfig('app');

const PORT = config.port || 3109;

app.listen(PORT, async () => {
    fs.promises.mkdir(process.cwd() + '/data/certs', { recursive: true }).catch(console.error);
    console.log(`Server is running on port: ${PORT}`);
    await connectMysql();
    const handle = await MinionController.syncMinions(null, null);
    if (!handle) {
        console.log('sync minions failure.');
    } else {
        console.log('sync minions completed');
    }
    const lifeLog = await ElasticController.syncLifeIndices(null, null);
    if (!lifeLog) {
        console.log('sync life indices failure.');
    } else {
        console.log('sync life indices success');
    }
    const syncCerts = await MinionController.syncCertsSensors(null, null);
    if (!syncCerts) {
        console.log('sync minions certs failure.');
    } else {
        console.log('sync minions certs completed');
    }
    CronLoader.init();
});