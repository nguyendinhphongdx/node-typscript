export interface GrafanaProps {
    id?:number | string;
    path: string;
    nameVersion: string;
    description?:string;
    version: number;
    size?: number | string;
    fileType: string;
    producer?: string;
}