import { Sequelize } from 'sequelize';
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.cwd() + '/data/db.sqlite',
    logging: false
});
export async function connectSqlite() {
    try {
        await sequelize.authenticate();
        console.log('Connection sqlite has been established success.');
        (async () => {
            await sequelize.sync({ force: true });
            // Code here
        })();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export default sequelize;