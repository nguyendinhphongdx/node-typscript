import app from "./app";
import { connectMysql } from "../database";
import * as fs from 'fs';
import getConfig from "../config";
import { AppConfig } from "types";
const config: AppConfig = getConfig('app');

const PORT = config.port || 3109;

app.listen(PORT, async () => {
    fs.promises.mkdir(process.cwd() + '/public/', { recursive: true }).catch(console.error);
    fs.promises.mkdir(process.cwd() + '/data/', { recursive: true }).catch(console.error);
    
    console.log(`Server is running on port: ${PORT}`);
    await connectMysql();
});