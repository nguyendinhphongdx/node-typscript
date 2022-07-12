import Ultis from "../ultis/ultis";
import getConfig from "../../config";
import { Config } from "types/config";
import { GroupHostPort, Minion } from "types/minions";
import { Certs } from "../ultis/Constant";
const config: Config = getConfig('exec-so');

class MinionService {
    generateComnandGetMinions() {
        return config.cmd.minions;
    }
    generateComnandReadMinions(minionfile: string) {
        return Ultis.replace$InString(config.cmd.readminion, [minionfile]);
    }
    generateComnandExecuteMinions(minionHost: string, minionRole: string, command: string) {
        return Ultis.replace$InString(config.minion.exec, [minionHost, minionRole, command]);
    }
    compileFirewallYAML(parser: any, chain: string, groupHost: GroupHostPort[]) {
        try {
            if (!parser.firewall) parser.firewall = {};
            if (!parser.firewall.assigned_hostgroups) parser.firewall.assigned_hostgroups = {};
            if (!parser.firewall.assigned_hostgroups.chain) parser.firewall.assigned_hostgroups.chain = {};
            if (!parser.firewall.assigned_hostgroups.chain[chain]) parser.firewall.assigned_hostgroups.chain[chain] = {};
            // if (!parser.firewall.assigned_hostgroups.chain[chain].hostgroups) parser.firewall.assigned_hostgroups.chain[chain].hostgroups = {};
            groupHost.forEach((group: GroupHostPort) => {
                parser.firewall.assigned_hostgroups.chain[chain].hostgroups[group.hostGroup] = {
                    portgroups: group.portGroup,
                }
            })
            return parser;
        } catch (error) {
            throw error;
        }
    }
    generateComnandsReadCertsSensor(minion: Minion) {
        const cmdCA = Ultis.replace$InString(config.cmd.readcert, [Certs.CA]);
        const cmdCLK = Ultis.replace$InString(config.cmd.readcert, [Certs.CLIENT_KEY]);
        const cmdCLC = Ultis.replace$InString(config.cmd.readcert, [Certs.CLIENT_CERT]);
        return {
            ca_cert: Ultis.replace$InString(config.minion.exec, [minion.hostName, minion.role,cmdCA]),
            client_cert:  Ultis.replace$InString(config.minion.exec, [minion.hostName, minion.role, cmdCLC]),
            client_key:  Ultis.replace$InString(config.minion.exec, [minion.hostName, minion.role, cmdCLK]),
        }
    }
}
export default new MinionService();