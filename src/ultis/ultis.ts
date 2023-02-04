
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
    response(res:express.Response, status: number, data?: any, message?: string) {
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
    getPagination(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { page, size } = req.query;
        const limit = size ? +Number(size) : 3;
        const offset = page ? Number(page) * limit : 0;
        req.query.limit = limit + '';
        req.query.offset = offset + '';
        next();
    };
    getPagingData(data: any, page:number, limit: number) {
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
}
export default new Ultis();