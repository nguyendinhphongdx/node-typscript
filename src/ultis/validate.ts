import * as express from "express";
import getConfig from "../../config";
import * as fs from 'fs';
import ultis from "./ultis";
import { RuleConfig } from "types";
const settings:RuleConfig = getConfig('rule');
const ruleTypes: string[] = settings.ruleTypes;
const producers: string[] = settings.producers;
export const validatorRule = {
    uploadRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.files || req.files.length < 1 || req.files[0].fieldname !== 'attachment') throw new Error('attachment is missing or invalid');
            if (!req.body.ruleType || !ruleTypes.includes(req.body.ruleType)) throw new Error('ruleType is missing or invalid');
            if (!req.body.ruleName) throw new Error('ruleName is missing or invalid');
            if (!req.body.version || !Number(req.body.version)) throw new Error('version is missing or invalid');
            if(!req.body.producer || !producers.includes(req.body.producer)) throw new Error('producer is missing or invalid');
            next();
        } catch (error) {
            if (req.files && req.files.length > 0) {
                fs.existsSync(req.files[0].path) && fs.unlinkSync(req.files[0].path);
            }
            ultis.response(res, 400, null, error.message || error);
        }
    },
    downloadRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.ruleId) throw new Error('ruleId is missing or invalid');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error)
        }
    },
    updateRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.ruleId) throw new Error('ruleId is missing or invalid');
            if (!req.body.ruleName) throw new Error('ruleName is missing or invalid');
            if (!req.body.ruleType || !ruleTypes.includes(req.body.ruleType)) throw new Error('ruleType is missing or invalid');
            if (!req.body.version || !Number(req.body.version)) throw new Error('version is missing or invalid');
            if(!req.body.producer || !producers.includes(req.body.producer)) throw new Error('producer is missing or invalid');
           
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error)
        }
    },
    deleteRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.ruleId) throw new Error('ruleId is missing or invalid');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error)
        }
    }
}
export const validatorGrafana = {
    uploadGrafana(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.files || req.files.length < 1 || req.files[0].fieldname !== 'attachment') throw new Error('attachment is missing or invalid');
            if (!req.body.grafanaName) throw new Error('grafanaName is missing or invalid');
            if (!req.body.version || !Number(req.body.version)) throw new Error('version is missing or invalid');
            if (!req.body.version || !Number(req.body.version)) throw new Error('version is missing or invalid');
            if(!req.body.producer || !producers.includes(req.body.producer)) throw new Error('producer is missing or invalid');
           
            next();
        } catch (error) {
            if (req.files && req.files.length > 0) {
                fs.existsSync(req.files[0].path) && fs.unlinkSync(req.files[0].path);
            }
            ultis.response(res, 400, null, error.message || error);
        }
    },
    downloadGrafana(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.grafanaId) throw new Error('grafanaId is missing or invalid');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error)
        }
    },
    updateGrafana(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.grafanaId) throw new Error('grafanaId is missing or invalid');
            if (!req.body.grafanaName) throw new Error('grafanaName is missing or invalid');
            if (!req.body.version || !Number(req.body.version)) throw new Error('version is missing or invalid');
            if(!req.body.producer || !producers.includes(req.body.producer)) throw new Error('producer is missing or invalid');
            
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error)
        }
    },
    deleteGrafana(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.grafanaId) throw new Error('grafanaId is missing or invalid');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error)
        }
    }
}