import Ultis from "../ultis/ultis";
import getConfig from "../../config";
import { Config } from "types/config";
const config:Config = getConfig('exec-so');

class HostService {
    generateComnandExcludeHost(hostGroup, ip) {
        return Ultis.replace$InString(config.cmd.excludehost, [hostGroup, ip]);
    }
    generateComnandAddHost(groupName) {
        return Ultis.replace$InString(config.cmd.addhostgroup, [groupName]);
    }
    generateComnandIncludeHost(groupName, ip) {
        return Ultis.replace$InString(config.cmd.includehost, [groupName, ip]);
    }
}
export default new HostService();