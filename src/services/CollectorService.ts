import axios, { AxiosResponse } from "axios";
import { ConfigCollector, ResponseErrorAgent, ResponseSuccessAgent } from "types";
import { CodeRequestAgent } from "../ultis/Constant";
import getConfig from "../../config";
const { fileBeat, logstash }: ConfigCollector = getConfig('collector');


class CollectorService {
    requestFileBeat(ip: string): Promise<ResponseSuccessAgent | ResponseErrorAgent> {
        return new Promise((resolve, reject) => {
            try {
                const url = fileBeat.url?.replace(/ip_manager/g, ip);
                axios({
                    url,
                    method: fileBeat.method,
                    timeout: 30000
                }).then((response) => {
                    // console.log(response);
                    resolve({
                        code: CodeRequestAgent.OK,
                        response
                    });
                }).catch((error) => resolve({
                    code: CodeRequestAgent.FAIL,
                    error: error.message || error
                }));
            } catch (error) {
                reject(error.message);
            }
        })
    }
    requestLogstash(ip: string): Promise<ResponseSuccessAgent | ResponseErrorAgent> {
        return new Promise((resolve, reject) => {
            try {
                const url = logstash.url?.replace(/ip_manager/g, ip);
                axios({
                    url,
                    method: logstash.method,
                    timeout: 30000
                }).then((response) => {
                    resolve({
                        // console.log(response);
                        code: CodeRequestAgent.OK,
                        response
                    });
                }).catch((error) => resolve({
                    code: CodeRequestAgent.FAIL,
                    error: error.message || error
                }));
            } catch (error) {
                reject(error.message);
            }
        })
    }
    convertResponseFileBeat(response: any) {
        try {
            if (response?.response.status === 200 && response.response?.data && response.response.data?.filebeat) {
                return response.response.data?.filebeat?.events
            } else {
                return null;
            }
        } catch (error) {

        }
    }
    convertResponseLogstash(response: any) {
        try {
            if (response?.response.status === 200 && response.response?.data) {
                return response.response.data?.events
            } else {
                return null;
            }
        } catch (error) {

        }
    }
}
export default new CollectorService();