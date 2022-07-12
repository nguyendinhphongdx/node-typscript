export interface Config {
    host: string;
    port: number;
    username: string;
    password: string;
    cmd: {
        hostgroup: string;
        portgroup: string;
        excludehost: string;
        addhostgroup: string;
        includehost: string;
        minions: string;
        readminion: string;
        readGlobal: string;
        restartCurator: string;
        readcert: string;
    },
    path: {
        minions: string;
        actionCurator: string;
        binCurator: string;
    },
    iptable: {
        addRule: string;
        deleteRule: string;
        addRuleMultiPort: string;
        deleteRuleMultiPort: string;
        getLineNumber: string;
        updateRule: string;
    },
    minion: {
        exec: string;
    }
}
export interface execConfig {
    host: string;
    port: number;
    username: string;
    password: string;
}
export interface Logs {
    stderr: string[];
    stdout: string[];
    close: any[];
    result: number;
}
export interface MultiLogs {
    cmd: string;
    logs: Logs;
}
export interface AppConfig {
    port: number;
    deployOnMinion: string;
}
export interface AppSetting {
    chain: string[];
    action: string[];
    protocol: string[];
}
export interface MySQL {
    host: string,
    database: string,
    user: string,
    password: string,
    force: boolean,
    port: number
}
export interface DataSharingConfig {
    domain: string;
    endpoints: {
        indices: string;
    }
}
export interface LifeLog {
    index_template?: string;
    warm: number;
    close: number;
    delete: number;
}
export interface TypeConfigModel {
    id?: string;
    key: string;
    path?: string;
    value: any;
    block?: boolean;
}
export interface CronData {
    id: string | number;
    name: string;
    from?: string | number | null;
    to?: string | number| null;
    schedule: string;
    timeZone?: string;
    status?: boolean;
}