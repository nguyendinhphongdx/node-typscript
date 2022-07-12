import axios, { Method } from "axios";

const request = (url: string, method: Method = "GET", body?: any, params?: any, headers?: any) => {
    console.log(url);

    return axios({
        method,
        url,
        data: body,
        params,
        headers
    })
}
export { request };