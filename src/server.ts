import app from "./app";
import { connectSqlite } from "../database";
import * as fs from 'fs';
import getConfig from "../config";
import { AppConfig } from "types";
import { pathUpload } from "./ultis/Constant";
const config: AppConfig = getConfig('app');

const PORT = config.port || 3109;


app.listen(PORT, async () => {
    fs.promises.mkdir(pathUpload.rule, { recursive: true }).catch(console.error);
    fs.promises.mkdir(pathUpload.grafana, { recursive: true }).catch(console.error);
    fs.promises.mkdir(pathUpload.onion, { recursive: true }).catch(console.error);
    
    console.log(`Server is running on port: ${PORT}`);
    await connectSqlite();
});