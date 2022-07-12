
import ruleController from './ruleRouter';


class RouterServer {
    init(app) {
        app.use('/update-center/rules', ruleController);
    }
}
export default new RouterServer();