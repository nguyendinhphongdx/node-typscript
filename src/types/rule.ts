import { AxiosResponse } from "axios";
export interface RuleProps {
    id?:number | string;
    path: string;
    ruleName: string;
    ruleType: string;
    version: string | number;
    size?: number | string;
}
export interface RuleConfig {
    ruleTypes: string[]
}