export interface Rule {
    id?: number;
    name:string;
    chain: 'DOCKER-USER' | 'INPUT' | 'OUTPUT';
    protocol: 'tcp' | 'udp';
    dports: number[];
    source: string;
    action: 'ACCEPT' | 'DROP',
    description?: string;
    category: number;
    tags?:string[];
}
export interface RuleLog extends Rule {
    logSourceId?: number;
    minionsId?: number[];
}