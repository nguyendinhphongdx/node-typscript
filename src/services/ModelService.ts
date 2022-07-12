import { Model, ModelStatic, WhereOptions } from "sequelize/types";
import ultis from "../ultis/ultis";

class ModelService {
    // unnecessary 
    async deleteIntermediateTable(
        InterTableModel: ModelStatic<Model<any, any>>,
        sideManyIds: number[], sideOneId: number,
        keys:
            { keySideOne: string, keySideMany: string }
    ) {
        try {
            const condition = {};
            condition[keys.keySideOne] = sideOneId;
            const handleDelete = sideManyIds.map((sideManyId: number) => {
                condition[keys.keySideMany] = sideManyId;

                return InterTableModel.destroy({
                    where: condition
                });
            })
            return Promise.all(handleDelete);
        } catch (error) {
            throw error;
        }
    }
    async foreDeleteReferenceTable(
        InterTableModel: ModelStatic<Model<any, any>>,
        ReferenceTableModel: ModelStatic<Model<any, any>>,
        deleteRecordId: number,
        keys:
            {
                keySideOrg: string,
                keySideRef: string,
                keysInternal: {
                    keySideOne: string,
                    keySideMany: string
                }
            }
    ) {
        try {
            // const conditionGetInters = {};
            // conditionGetInters[keys.keySideOrg] = deleteRecordId;
            // const interRecords = await InterTableModel.findAll({ where: conditionGetInters });

            // const condition = {};
            // condition[keys.keySideOne] = sideOneId;
            // const handleDelete = sideManyIds.map((sideManyId: number) => {
            //     condition[keys.keySideMany] = sideManyId;

            //     return InterTableModel.destroy({
            //         where: condition
            //     });
            // })
            // return Promise.all(handleDelete);
        } catch (error) {
            throw error;
        }
    }
    async updateIntermediateTable(
        arrayOld: number[], arrayNew: number[],
        InterTableModel: ModelStatic<Model<any, any>>,
        sideOneId: number,
        keys:
            { keySideOne: string, keySideMany: string }
    ): Promise<(number | Model<any, any>)[]> {
        try {
            const { plus, sub } = ultis.differentTwoArray(arrayOld, arrayNew);
            const condition = {};
            condition[keys.keySideOne] = sideOneId;
            const handleSub = sub.map((item: number) => {
                condition[keys.keySideMany] = item;
                return InterTableModel.destroy({ where: condition });
            })
            const handlePlus = plus.map((item: number) => {

                condition[keys.keySideMany] = item;
                return InterTableModel.create(condition);
            })
            return Promise.all([...handleSub, ...handlePlus]);
        } catch (error) {
            throw error;
        }
    }
    createOrUpdate<T>(Model: ModelStatic<Model<any, any>>, condition: WhereOptions<T>, defaultValue?: Omit<T, string>): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const exists = await Model.findOne({ where: condition });
                const result = exists ? await exists.update(defaultValue) : await Model.create(defaultValue);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        })
    }
}
export default new ModelService();