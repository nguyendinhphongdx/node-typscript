export interface GroupHostPort {
    hostGroup: string;
    portGroup: string[];
}
export interface Minion {
    id?: number;
    hostName: string;
    role: string;
    ipAddress?: string;
}
export interface RoleNameMinion {
    name: string; 
    role: string;
}