
import ruleRouter from './ruleRouter';


class RouterServer {
    init(app) {
        app.use('/update-center/rules', ruleRouter);
    }
}
export default new RouterServer();