import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";
import * as morgan from "morgan";
import RouterServer from './router';

class App {

    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        RouterServer.init(this.app);
    }

    private config(): void {
        // this.app.use('/static', express.static(path.join(process.cwd(), 'views')))
        this.app.set('views', path.join(process.cwd(), 'views'));
        this.app.set('view engine', 'ejs');
        // Giúp chúng ta tiếp nhận dữ liệu từ body của request
        this.app.use(express.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(morgan('combined'));
    }

}

export default new App().app;