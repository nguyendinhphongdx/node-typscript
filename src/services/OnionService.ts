import { OnionModel } from "../entities";
import { OnionProps } from "types";

class OnionService {
    async createRecord(onion: OnionProps) {
        try {
            const exists = await OnionModel.findOne({ where: { nameVersion: onion.nameVersion, version: onion.version } });
            if (exists) throw new Error('onion is exists');
            return OnionModel.create(onion);
        } catch (error) {
            throw error;
        }
    }
}
export default new OnionService();