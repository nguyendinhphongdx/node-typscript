import { CronJob } from 'cron';
import { CronData } from '../src/types';
import CronGenerator, { ICronGenerator } from './cronGenerator';
interface DynamiSto {
    // 👇️ key         value
    [key: string]: ICronGenerator;
}
class CronService {
    store: DynamiSto;
    constructor() {
        this.store = {};
    }
    addJob(optionsJob: CronData, run:(...args: any[]) => any | Promise<any>): void {
        const { id } = optionsJob;
        if (this.store[id]) {
            console.error(`Cron job with control sharing with id ${id} is existed`);
            return;
        }
        if (!run) {
            console.error(`Cron job funct with id ${id} is not found`);
            return;
        }
        this.store[id] = new CronGenerator(optionsJob, run);
        if (this.store[id].isEmpty()) {
            console.error(`Cron job with control sharing ${this.store[id].getName()} is empty`);
            delete this.store[id];
        }
    }
    update = (data: CronData) => {
        const id = data.id;
        if (id) {
            if (!this.store[id]) {
                console.error(`Update - control sharing with id ${id} not found...`);
                return;
            }
            this.store[id].updateData(data);
        }
    }

    changeTime = (id: string, schedule: string, timeZone: string, status: boolean) => {
        if (!this.store[id]) {
            console.error(`Change Time - control sharing with id ${id} not found...`);
            return;
        }
        this.store[id].changeTime(schedule, timeZone, status);
        console.info(`Change Time - cron job with control sharing ${this.store[id].getName()} successfully...`);
    }

    stopJob = (id:string) => {
        if (!this.store[id]) {
            console.error(`Stop Job - control sharing with id ${id} not found...`);
            return;
        }
        this.store[id].stop();
        console.info(`Stop cron job with control sharing ${this.store[id].getName()} successfully...`);
    }

    restartJob = (id:string) => {
        if (!this.store[id]) {
            console.error(`Restart Job - control sharing with id ${id} not found...`);
            return;
        }
        this.store[id].start();
        console.info(`Restart cron job with control sharing ${this.store[id].getName()} successfully...`);
    }

    deleteJob = (id:string) => {
        if (!this.store[id]) {
            console.error(`Delete Job - control sharing with id with id  not found...`);
            return;
        }
        this.store[id].stop();
        console.info(`Delete cron job with control sharing ${this.store[id].getName()} successfully...`);
        delete this.store[id];
    }
}
export default new CronService();