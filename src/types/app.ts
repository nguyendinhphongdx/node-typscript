export interface AppConfig {
    port: number,
    subDomain: string,
}
export interface CountAll<T>{
    rows: T[];
    count: number;
}