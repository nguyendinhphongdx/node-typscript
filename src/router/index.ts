
import grafanaRouter from './grafanaRouter';
import onionRouter from './onionRouter';
import ruleRouter from './ruleRouter';
import settingRouter from './settingRouter';


class RouterServer {
    init(app) {
        app.use('/update-center/rules', ruleRouter);
        app.use('/update-center/grafana', grafanaRouter);
        app.use('/update-center/onion', onionRouter);
        app.use('/update-center/settings', settingRouter);
    }
}
export default new RouterServer();