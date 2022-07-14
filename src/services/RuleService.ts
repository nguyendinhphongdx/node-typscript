import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { RuleModel } from "../entities";
import { ContentFileRule, RuleProps } from "types";
import { Op } from "sequelize";

class RuleService {
    async createRecord(rule: RuleProps) {
        try {
            const exists = await RuleModel.findOne({
                where: {
                    ruleName: rule.ruleName, ruleType: rule.ruleType, version: rule.version
                }
            });
            if (exists) throw new Error('rule is exists');
            return RuleModel.create(rule);
        } catch (error) {
            throw error;
        }
    }
    async findOne(ruleName: string, ruleType: string, version: string) {
        try {
            const exists = await RuleModel.findOne({
                where: {
                    ruleName, ruleType, version
                }
            });
            if (!exists) throw new Error('rule is exists');
            return exists;
        } catch (error) {
            throw error;
        }
    }
   
    async checkFileContentAccept(path: string) {
        return new Promise<ContentFileRule>((resolve, reject) => {
            try {
                if (!fs.existsSync(path)) reject(new Error(path + ' not found or deleted'));
                const content: any = yaml.load(fs.readFileSync(path, 'utf8'));
                if (!content) reject(new Error('Load file fail'));
                const { type, name, index } = content;
                if (!type) throw new Error('Rule file is not includes type');
                if (!name) throw new Error('Rule file is not includes name');
                if (!index) throw new Error('Rule file is not includes index');
                resolve(content);
            } catch (error) {
                reject(error);
            }
        })
    }
}
export default new RuleService();