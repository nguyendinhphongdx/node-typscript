export interface LogSource {
    id?: number;
    sourceName: string;
    description?: string;
    machineId?: number;
}
export interface MachineState {
    id?: number;
    name: string;
    ip: string;
    mac?:string;
    location?: string;
    description?: string;
}