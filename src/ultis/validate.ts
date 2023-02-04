import * as express from "express";
import ultis from "./ultis";

export const validatorUser = {
    async getUser(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    createUser(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.email) throw new Error('email is missing or invalid');
            if (!req.body.password) throw new Error('password is missing or invalid');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error)
        }
    },
    updateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.ruleId) throw new Error('ruleId is missing or invalid');
            // if (!req.body.ruleName) throw new Error('ruleName is missing or invalid');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error)
        }
    },
    deleteUser(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error)
        }
    }
}