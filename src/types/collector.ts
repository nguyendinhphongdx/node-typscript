import { AxiosResponse } from "axios";

export interface Collector {
    id?: string | number;
    hostName: string;
    role: string;
    ipAddress?: string;
    active: boolean;
    fileBeat: {
        reconnect: number;
        lastUpdate: string;
        data: any;
    };
    logstash: {
        reconnect: number;
        lastUpdate: string;
        data: any;
    };
}
export interface ConfigCollector {
    fileBeat: {
        url: string;
        method: string;
    };
    logstash: {
        url: string;
        method: string;
    },
    schedule: string
}
export interface ResponseSuccessAgent {
    code: number;
    response: AxiosResponse<any, any>
}
export interface ResponseErrorAgent {
    code: number;
    error: any
}