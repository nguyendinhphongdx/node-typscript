import { AxiosResponse } from "axios";
export interface RuleProps {
    id?:number | string;
    path: string;
    ruleName: string;
    ruleType: string;
    version: string;
    size?: number | string;
    fileType: string;
    description?: string;
    producer?: string;
}
export interface RuleConfig {
    ruleTypes: string[], 
    producers: string[],
}