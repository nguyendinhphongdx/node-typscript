import * as express from 'express';
import { AppSetting } from 'types';
import getConfig from '../../config';
import ultis from './ultis';
const appSettings: AppSetting = getConfig('settings');
const validator = {
    excludeHost(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.hostGroup) throw new Error('hostgroup not found');
            if (!req.body.ip) throw new Error('ip not found');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    addHostGroup(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.hostGroupName) throw new Error('hostGroupName not found');
            if (!req.body.minionsId) throw new Error('minionsId not found');

            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    includeHost(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.hostGroup) throw new Error('hostgroup not found');
            if (!req.body.ip) throw new Error('ip not found');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    applyFirewall(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.minionName) throw new Error('minionName not found');
            if (!req.body.hostGroup) throw new Error('hostGroup not found');
            if (!req.body.portGroup) throw new Error('portGroup not found');
            if (!req.body.chain) throw new Error('chain not found');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    getCertsSensor(req: express.Request, res: express.Response, next: express.NextFunction){
        try {
            if (!req.params.sensorName) throw new Error('sensorName is missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    updateHostGroup(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.hostGroupName) throw new Error('hostGroupName not found');
            if (!req.body.minionsId) throw new Error('minionsId not found');
            if (!req.params.hostGroupId || !Number(req.params.hostGroupId)) throw new Error('hostGroupId is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    deleteHostGroup(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.hostGroupId || !Number(req.params.hostGroupId)) throw new Error('hostGroupId is invalid or missing');
            if (typeof req.body.forceRef !== 'boolean') throw new Error('forceRef is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    }


}
export const groupValidator = {
    addGroup(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.groupName) throw new Error('groupName not found');
            if (!req.body.minionsId) throw new Error('minionsId not found');

            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    updateGroup(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.groupName) throw new Error('groupName not found');
            if (!req.body.minionsId) throw new Error('minionsId not found');
            if (!req.params.groupId || !Number(req.params.groupId)) throw new Error('groupId is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    changeRulesInGroup(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { groupId } = req.params;
        const { rulesId } = req.body;
        try {
            if (!groupId || !Number(groupId)) throw new Error('groupId is invalid or missing');
            if (!rulesId || !Array.isArray(rulesId)) throw new Error('rulesId is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    deleteGroup(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.groupId || !Number(req.params.groupId)) throw new Error('groupId is invalid or missing');
            if (typeof req.body.forceRef !== 'boolean') throw new Error('forceRef is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    }
}
export const ruleValidator = {
    addRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.name) throw new Error('name is missing');
            if (!req.body.chain) throw new Error('chain is missing');
            if (!appSettings.chain.includes(req.body.chain)) throw new Error('chain is not in the app settings');
            if (!req.body.source) throw new Error('source is missing');
            if (!req.body.dports || !Array.isArray(req.body.dports)) throw new Error('dports is missing or must be an array');
            if (!req.body.protocol) throw new Error('protocol is missing');
            if (!appSettings.protocol.includes(req.body.protocol)) throw new Error('protocol is not in the app settings');
            if (!req.body.action) throw new Error('action is missing');
            if (!appSettings.action.includes(req.body.action)) throw new Error('action is not in the app settings');
            if (!req.body.groups) throw new Error('groups is missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    deleteRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.ruleId || !Number(req.params.ruleId)) throw new Error('ruleId is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    updateRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.source) throw new Error('source is missing');
            if (!req.body.dports || !Array.isArray(req.body.dports)) throw new Error('dports is missing or must be an array');
            if (!req.body.protocol) throw new Error('protocol is missing');
            if (!appSettings.protocol.includes(req.body.protocol)) throw new Error('protocol is not in the app settings');
            if (!req.body.action) throw new Error('action is missing');
            if (!appSettings.action.includes(req.body.action)) throw new Error('action is not in the app settings');
            if (!req.params.ruleId || !Number(req.params.ruleId)) throw new Error('ruleId is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
}
export const machineValidator = {
    addMachine(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.name) throw new Error('name is missing');
            if (!req.body.ip) throw new Error('ip is missing');
            if (!req.body.mac) throw new Error('mac is missing');
            if (!req.body.location) throw new Error('location is mission');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    deleteMachine(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.machineId || !Number(req.params.machineId)) throw new Error('machineId is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    updateMachine(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.machineId || !Number(req.params.machineId)) throw new Error('machineId is invalid or missing');
            if (!req.body.name) throw new Error('name is missing');
            if (!req.body.ip) throw new Error('ip is missing');
            if (!req.body.mac) throw new Error('mac is missing');
            if (!req.body.location) throw new Error('location is mission');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
}
export const logSourceValidator = {
    addSource(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.sourceName) throw new Error('sourceName is missing');
            if (!req.body.machineId || !Number(req.body.machineId)) throw new Error('machineId is invalid ormissing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    deleteSource(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.sourceId || !Number(req.params.sourceId)) throw new Error('sourceId is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    updateSource(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.sourceId || !Number(req.params.sourceId)) throw new Error('machineId is invalid or missing');
            if (!req.body.sourceName) throw new Error('sourceName is missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
}
export const ruleLogValidator = {
    addRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.name) throw new Error('name is missing');
            if (!req.body.chain) throw new Error('chain is missing');
            if (!appSettings.chain.includes(req.body.chain)) throw new Error('chain is not in the app settings');
            if (!req.body.dports || !Array.isArray(req.body.dports)) throw new Error('dports is missing or must be an array');
            if (!req.body.protocol) throw new Error('protocol is missing');
            if (!appSettings.protocol.includes(req.body.protocol)) throw new Error('protocol is not in the app settings');
            if (!req.body.action) throw new Error('action is missing');
            if (!appSettings.action.includes(req.body.action)) throw new Error('action is not in the app settings');
            if (!req.body.minionsId) throw new Error('minionsId is missing');
            if (!req.body.sourceLogId || !Number(req.body.sourceLogId)) throw new Error('sourceLogId is missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    deleteRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.params.ruleId || !Number(req.params.ruleId)) throw new Error('ruleId is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
    updateRule(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.dports || !Array.isArray(req.body.dports)) throw new Error('dports is missing or must be an array');
            if (!req.body.protocol) throw new Error('protocol is missing');
            if (!appSettings.protocol.includes(req.body.protocol)) throw new Error('protocol is not in the app settings');
            if (!req.body.action) throw new Error('action is missing');
            if (!appSettings.action.includes(req.body.action)) throw new Error('action is not in the app settings');
            if (!req.body.minionsId) throw new Error('minionsId is missing');
            if (!req.params.ruleId || !Number(req.params.ruleId)) throw new Error('ruleId is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
}
export const validatorLifeIndex = {
    addManageLifeIndex(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            if (!req.body.warm || !Number(req.body.warm)) throw new Error('warm is missing or must be an number');
            if (!req.body.close || !Number(req.body.close)) throw new Error('close is missing or must be an number');
            if (!req.body.delete ||!Number(req.body.delete)) throw new Error('delete is missing or must be an number');
            if (!req.body.index  || typeof req.body.index !== "string") throw new Error('index is invalid or missing');
            next();
        } catch (error) {
            ultis.response(res, 400, null, error.message || error);
        }
    },
}
export default validator;