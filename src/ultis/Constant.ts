export const CodeExecFile = {
    OK: 1,
    FAIL: 0,
}
export const MessageExecFile = {
    OK: "Execute Succesfully",
    FAIL: "Execute Failed",
}
export const CodeExecCMD = {
    OK: 0,
    FAIL: 1,
}
export const CodeRequestAgent = {
    OK: 0,
    FAIL: 1,
}
export const TypeOfRule = {
    FIREWALL: 0,
    LOGSOURCE: 1,
}
export const CodeExecCMDS = {
    OK: 0,
    FAIL: 1,
}
export const KeyConfig = {
    global: "global.sls",
    binClose: 'close.sh',
    binDelete: 'delete.sh',
    binWarm: 'warm.sh',
}
export const PathConfig = {
    pathGlobal: process.cwd() + "/mount/global.sls",
    pathTemplate: process.cwd() + "/config/",
    pathTemplateCopyAction: process.cwd() + "/mount/action/",
    pathTemplateCopyBin: process.cwd() + "/mount/bin/",
    pathCerts: process.cwd() + "/data/certs/",

}
export const MessageConfig = {
    globalInUse: 'config file is in use'
}

export const RoleMinion = {
    Sensor: "sensor"
}
export const Certs = {
    CA : 'ca_cert',
    CLIENT_CERT: 'client_cert',
    CLIENT_KEY: 'client_key'
}
export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
export const cronIds = {
    connectSensor: 'connect_sensor',
}