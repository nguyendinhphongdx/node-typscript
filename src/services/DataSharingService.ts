import { request } from "../middleware/request";
import getConfig from '../../config';
import { DataSharingConfig } from "types";
const config: DataSharingConfig = getConfig("data-sharing");

class DataSharingService {
    async getIndexes() {
        const response = await request(config.domain + config.endpoints.indices);
        return response.data;
    }
}
export default new DataSharingService();