import userRouter from './users';
import hostRouter_F from './hosts_f';
import groupRouter_I from './groups';
import portRouter from './ports';
import minionRouter from './minions';
import ruleRouter from './rules';
import settingsRouter from './settings';
import machineRouter from './machines';
import logSourceRouter from './logSource';
import ruleLogRouter from './ruleLog';
import elasticRouter from './elastic-search';
import collectorRouter from './collector';


class RouterServer {
    init(app) {
        app.use('/soc-firewall/users', userRouter);
        app.use('/soc-firewall/host', hostRouter_F);
        app.use('/soc-firewall/port', portRouter);
        app.use('/soc-firewall/minions', minionRouter);
        app.use('/soc-firewall/groups', groupRouter_I);
        app.use('/soc-firewall/rules', ruleRouter);
        app.use('/soc-firewall/settings', settingsRouter);
        app.use('/soc-firewall/machines', machineRouter);
        app.use('/soc-firewall/log_sources', logSourceRouter);
        app.use('/soc-firewall/log_rules', ruleLogRouter);

        app.use('/soc-firewall/elastic-search', elasticRouter);
        app.use('/soc-firewall/collectors', collectorRouter);
    }
}
export default new RouterServer();