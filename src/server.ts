import * as open from 'open'; 
import app from "./app";
import { connectSqlite } from "../database";
import getConfig from "../config";
import { AppConfig } from "types";
const config: AppConfig = getConfig('app');

const PORT = config.port || 3109;


app.listen(PORT, async () => {
    console.log(`Server is running on port: ${PORT}`);
    await connectSqlite();
    await open('https://localhost:3000/api-server/views/app', {app: {name: 'chrome'}});
});