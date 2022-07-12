export interface AppConfig {
    port: number
}
export interface MysqlConfig {
    host: string,
    database: string,
    user: string,
    password: string,
    force: boolean,
    port: number
}