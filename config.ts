import * as fs from "fs";

export const checkPathExisted = (path:string): boolean => {
    if (!path) return false;
    if (fs.existsSync(path)) {
        return true
    }
    return false;
}

const getConfig = (name: string) => {
    try {
        let pathFile = `${__dirname}/config/config-${name}.json`;
        if (process.env.NODE_ENV === 'production') {
            pathFile = `/etc/config/config-${name}.json`;
        }
        const isPathExisted = checkPathExisted(pathFile);
        if (!isPathExisted) {
            console.error(new Error(`Path config ${pathFile} is not existed`));
            process.exit(1);
        }
        const rawData = fs.readFileSync(pathFile);
        return JSON.parse(Buffer.from(rawData).toString());
    } catch (error) {
        console.error(new Error(`Get config config-${name} failed: ${error.message || error}`));
        process.exit(1);
    }
}

export default getConfig;