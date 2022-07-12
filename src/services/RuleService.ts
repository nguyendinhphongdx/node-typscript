
import ExecutorService from '../../exec-cmd/exec-ssh';
import getConfig from '../../config';
import ultis from '../ultis/ultis';
import { Rule, Minion, Config, Logs, MultiLogs, RuleLog } from 'types';
import { MinionModel, RuleLogModel, RuleModel } from '../entities';
const config: Config = getConfig('exec-so');
class RuleService {
    tranferDowloadFileSSH(pathFileLocal: string, pathFileRemote: string): Promise<number> {
        return ExecutorService.tranferGetFile(pathFileLocal, pathFileRemote);
    }
    generateComnandAddRule(rule: Rule): string {
        // sudo iptables --wait -t filter -I INPUT -p tcp --dport 1803 --source 192.168.1.101 --jump ACCEPT
        return ultis.replace$InString(config.iptable.addRuleMultiPort, [rule.chain, rule.protocol, rule.dports.join(','), rule.source, rule.action])
    }
    generateComnandAddRuleWithMinion(rule: Rule, minion: Minion): string {
        // sudo iptables --wait -t filter -I INPUT -p tcp --dport 1803 --source 192.168.1.101 --jump ACCEPT
        const cmdAdd = ultis.replace$InString(config.iptable.addRuleMultiPort, [rule.chain, rule.protocol, rule.dports.join(','), rule.source, rule.action])
        return ultis.replace$InString(config.minion.exec, [minion.hostName, minion.role, cmdAdd]);
    }
    generateComnandRemoveRule(rule: Rule): string {
        // sudo iptables -D $ -s $ -p $ --dport $ -j $
        return ultis.replace$InString(config.iptable.deleteRuleMultiPort, [rule.chain, rule.source, rule.protocol, rule.dports.join(','), rule.action])
    }
    generateComnandRemoveRuleWithMinion(rule: Rule, minion: Minion): string {
        // sudo iptables -D $ -s $ -p $ --dport $ -j $
        const cmdRemove = ultis.replace$InString(config.iptable.deleteRuleMultiPort, [rule.chain, rule.source, rule.protocol, rule.dports.join(','), rule.action])
        return ultis.replace$InString(config.minion.exec, [minion.hostName, minion.role, cmdRemove]);
    }
    generateComnandRuleLineNumberWithMinion(rule: Rule, minion: Minion): string {
        const cmdLine = ultis.replace$InString(config.iptable.getLineNumber, [rule.chain, rule.protocol, rule.dports.join(','), rule.source, rule.action])
        return ultis.replace$InString(config.minion.exec, [minion.hostName, minion.role, cmdLine]);
    }
    generateComnandRuleLineNumber(rule: Rule): string {
        return ultis.replace$InString(config.iptable.getLineNumber, [rule.chain, rule.protocol, rule.dports.join(','), rule.source, rule.action])
    }
    generateComnandUpdateWithMinion(rule: Rule, minion: Minion, lineNumber: number): string {
        const cmdLine = ultis.replace$InString(config.iptable.updateRule, [rule.chain, lineNumber + '', rule.protocol, rule.dports.join(','), rule.source, rule.action])
        return ultis.replace$InString(config.minion.exec, [minion.hostName, minion.role, cmdLine]);
    }
    generateComnandUpdate(rule: Rule, lineNumber: number): string {
        return ultis.replace$InString(config.iptable.updateRule, [rule.chain, lineNumber + '', rule.protocol, rule.dports.join(','), rule.source, rule.action])

    }

    execCommandSSH(cmdAdd: string): Promise<Logs> {
        return ExecutorService.execCmd(cmdAdd);
    }
    execMultiCommandSSH(cmds: string[]): Promise<MultiLogs[]> | null {
        if (cmds.length <= 0) return null;
        return ExecutorService.execCmds(cmds);
    }

    async checkRuleExists(rule: Rule) {
        const existsRules = await RuleModel.findAll({ where: { chain: rule.chain, source: rule.source, protocol: rule.protocol, action: rule.action } });
        const existsRuleLogs = await RuleLogModel.findAll({ where: { chain: rule.chain, source: rule.source, protocol: rule.protocol, action: rule.action } });

        for (let index = 0; index < existsRules.length; index++) {
            if (ultis.compareTwoArray(existsRules[index].dports, rule.dports)) return true;
        }
        for (let index = 0; index < existsRuleLogs.length; index++) {
            if (ultis.compareTwoArray(existsRuleLogs[index].dports, rule.dports)) return true;
        }
        return false;
    }
    async RuleLogMapMinionInfoByMinionIds(rules: RuleLog[] | any) {
        const result = [];
        for (let index = 0; index < rules.length; index++) {
            const minions:any = await MinionModel.findAll({ where: { id: rules[index].minionsId } });
            result.push({
                ...rules[index].dataValues,
                minions:minions,
            })
        }
        return result;
    }
}
export default new RuleService();