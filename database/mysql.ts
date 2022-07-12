import { Options, Sequelize } from 'sequelize';
import * as mysqlCnn from 'mysql2/promise';
import getConfig from '../config';
import { MysqlConfig } from 'types';

const mysql:MysqlConfig = getConfig('mysql');
const config: Options = {
    host: mysql.host || 'localhost',
    dialect: 'mysql',
    logging: false,
};
console.log(config);
const sequelize = new Sequelize(mysql.database, mysql.user, mysql.password, config);
export async function connectMysql() {
    try {
        const { host, port, user, password, database } = mysql;
        const connection = await mysqlCnn.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

        await sequelize.authenticate();
        await sequelize.sync({
            // force: mysql.force || true
        });
        console.log('Mysql has been established success.');
    } catch (error) {
        console.log('Unable to connect to the database:', error);
    }
}
export default sequelize;