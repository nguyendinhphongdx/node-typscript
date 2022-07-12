import { CronJob, CronTime } from 'cron';
import { isValidCron } from 'cron-validator';
import * as moment from 'moment';
import { DEFAULT_TIMEZONE } from '../src/ultis/Constant';
import utils from '../src/ultis/ultis';
import { CronData } from '../src/types';
export interface ICronGenerator {
    job: CronJob | null;
    run: (...args: any[]) => void;
    data: CronData;
    init: () => void;
    getName: () => string | number;
    getNextDate: () => any;
    getPrevDate: () => string;
    getCurrentDate: () => string | undefined;
    isEmpty: () => boolean;
    changeTime: (schedule: string, timeZone: string, restart: boolean) => void;
    updateData: (data: CronData) => any;
    start: () => void;
    stop: () => void;
}
class CronGenerator implements ICronGenerator {
    job: CronJob | null;
    run: (...args: any[]) => any | Promise<any>;
    data: CronData;
    constructor(data: CronData, run: (...args: any[]) => any | Promise<any>) {
        this.job = null;
        this.data = {
            ...data,
            from: null,
            to: null,
        };
        this.run = run;
        this.init();
    }
    init() {
        if (!this.data || !this.data.name) {
            console.error(`name cron is missing`);
            return;
        }
        if (!this.run) {
            console.error(`cron ${this.data.name} not found run funct`);
            return;
        }
        let { name, schedule, timeZone = DEFAULT_TIMEZONE } = this.data;

        this.data.from = new Date().getTime() - utils.convertToTimestamp(schedule);
        this.data.to = new Date().getTime();
        schedule = utils.convertSchedule(schedule);

        if (!schedule || !isValidCron(schedule)) {
            console.error(`Schedule is not valid cron in init func ${schedule}`);
            return;
        }
        console.log(`Job ${name} started ...`);

        this.job = new CronJob({
            cronTime: schedule,
            onTick: () => {
                try {
                    this.run(this.data, this);
                    this.data.from = this.data.to;
                    this.data.to = new Date().getTime();
                    console.info(`Running job ${name} - from:${this.getPrevDate()} to:${this.getCurrentDate()}`);
                } catch (error) {
                    console.error(`Run job ${name} failed: ${error.message}`);
                }
            },
            start: this.data.status,
            timeZone,
        });
    }
    getName() {
        return this.data?.name || this.data?.id;
    }

    getNextDate() {
        if (this.job) {
            return this.job.nextDates();
        } else {
            console.error("job is not available");
        }
    }

    getPrevDate() {
        const currentDate = moment(this.getCurrentDate());
        const diff = moment(this.getNextDate()).diff(currentDate);
        return currentDate.subtract(diff).toISOString();
    }

    getCurrentDate() {
        if (this.job) {
            return this.job.lastDate().toISOString();
        } else {
            console.error("job is not available");
        }
    }

    isEmpty() {
        return !!!this.job;
    }

    changeTime(schedule: string, timeZone: string = DEFAULT_TIMEZONE, restart = true) {
        if (!isValidCron(schedule)) {
            console.error(`Schedule is not valid cron in changeTime func ${schedule}`);
            return;
        }
        if (this.job) {
            this.job.stop();
            this.job.setTime(new CronTime(schedule, timeZone));
            if (restart) {
                this.job.start();
                console.info(`Running job ${this.data.name}... changed`);
            }
        } else {
            console.log("Job is not valid");
        }

    }

    updateData(data: CronData) {
        if (data) {
            this.data = data;
            console.info(`Job update with data changed: ${JSON.stringify({ data })}`);
            return;
        }
        console.error(`Job update data is empty: ${JSON.stringify({ data })}`);
    }

    start() {
        if (this.job) {
            this.job.start();
            console.info(`Started job ${this.data.name}`);
        } else {
            console.error("job is not available");
        }
    }

    stop() {
        if (this.job) {
            this.job.stop();
            console.info(`Stopped job ${this.data.name}`);
        } else {
            console.error("job is not available");
        }
    }
}
export default CronGenerator;