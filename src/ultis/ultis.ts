
import * as express from 'express';
declare global {
    interface String {
        replaceAt(index: number, replacement: any): string;
    }
}
class Ultis {
    replace$InString(string: string, ArrValues: string[]): string | null {
        String.prototype.replaceAt = function (index, replacement) {
            if (index >= this.length) {
                return this.valueOf();
            }

            return this.substring(0, index) + replacement + this.substring(index + 1);
        };
        try {
            const findAllIndex = [];
            for (let index = 0; index < string.length; index++) {
                if (string[index] === "$") {
                    findAllIndex.push(index);
                }
            }
            if (ArrValues.length !== findAllIndex.length) {
                console.log('replace ', string, `map fail`);
                return null;
            } else {
                ArrValues.forEach((_item, index) => {
                    const indexOf = string.indexOf("$");
                    string = string.replaceAt(indexOf, _item);
                });
                return string;
            }
        } catch (error) {
            throw error;
        }
    }
    replaceTemplateActionFile(stringFile: string, sector: string, action: string, index: string): string | null {
        try {
            stringFile = stringFile.replace(/_sector_/g, sector);
            stringFile = stringFile.replace(/_index_/g, index);
            return stringFile.replace(/_action_/g, action);
        } catch (error) {
            throw error;
        }
    }
    response(res, status: number, data?: any, message?: string) {
        const body = {
            message, data,
        }
        if (!data) delete body.data;
        if (status === 200) {
            res.status(status).json(data)
        } else {
            res.status(status).json(body)
        }
    }
    differentTwoArray(arr1: Array<number>, arr2: Array<number>) {
        let intersection = arr1.filter(x => arr2.includes(x));
        let sub = arr1.filter(x => !arr2.includes(x));
        let plus = arr1
            .filter(x => !arr2.includes(x) && !sub.includes(x))
            .concat(arr2.filter(x => !arr1.includes(x)));
        return {
            intersection, sub, plus
        }
    }
    uniqueSetArrayObject(array: Array<any>, key: string): Array<any> {
        const result = [];
        array.forEach(x => {
            if (!result.find(ext => ext[key] === x[key])) result.push(x);
        })
        return result;
    }
    getPagination(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { page, size } = req.query;
        const limit = size ? +Number(size) : 3;
        const offset = page ? Number(page) * limit : 0;
        req.query.limit = limit + '';
        req.query.offset = offset + '';
        next();
    };
    getPagingData(data, page, limit) {
        const { count: totalItems, rows: records } = data;
        const currentPage = page ? +page : 0;
        const totalPages = page ? Math.ceil(totalItems / limit) : 1;
        return { totalItems, data: records, totalPages, currentPage };
    };
    compareTwoArray(array1: Array<number>, array2: Array<number>): boolean {
        const array2Sorted = array2.slice().sort();
        return array1.length === array2.length && array1.slice().sort().every(function (value, index) {
            return value === array2Sorted[index];
        });
    }
    convertSchedule = (schedule: string): string => {
        if (!schedule) {
            return;
        }
        const duration = schedule.slice(schedule.length - 1, schedule.length);
        const time = schedule.slice(0, schedule.length - 1);
        if (isNaN(Number(time))) {
            return;
        }
        switch (duration) {
            case 'M':
                return `*/${Number(time)} * * * *`;
            case 'H':
                return `0 */${Number(time)} * * *`;
            case 'D':
                return `0 0 */${Number(time)} * *`;
            case 'W':
                return '0 0 * * 1';
            default:
                return;
        }
    }
    convertToTimestamp = (schedule: string): number => {
        if (!schedule) {
            return;
        }
        const duration = schedule.slice(schedule.length - 1, schedule.length);
        const time = schedule.slice(0, schedule.length - 1);
        if (isNaN(Number(time))) {
            return;
        }
        switch (duration) {
            case 'M':
                return Number(time) * 60000;
            case 'H':
                return Number(time) * 60000 * 60;
            case 'D':
                return Number(time) * 60000 * 60 * 24;
            case 'W':
                return Number(time) * 60000 * 60 * 24 * 7;
            default:
                return;
        }
    }
    generateNameFileRule(type: string, name: string) {
        const nameFile = name.toLowerCase().replace(/ /g, "_");
        return "bkav-rule-" + type + "-" + nameFile + ".yaml";
    }
}
export default new Ultis();