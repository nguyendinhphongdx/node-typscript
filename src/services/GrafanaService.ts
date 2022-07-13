import GrafanaModel from "../entities/GrafanaModel";
import { GrafanaProps } from "types";

class GrafanaService {
    async createRecord(grafana: GrafanaProps){
        try {
            const exists = await GrafanaModel.findOne({where: {grafanaName: grafana.grafanaName, version: grafana.version}});
            if(exists) throw new Error('grafana is exists');
            return GrafanaModel.create(grafana);
        } catch (error) {
            throw error;
        }
   }
}
export default new GrafanaService();