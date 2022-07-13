
import grafanaRouter from './grafanaRouter';
import ruleRouter from './ruleRouter';


class RouterServer {
    init(app) {
        app.use('/update-center/rules', ruleRouter);
        app.use('/update-center/grafana', grafanaRouter);
    }
}
export default new RouterServer();