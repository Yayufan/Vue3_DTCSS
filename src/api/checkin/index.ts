import request from "@/utils/request";
import { AxiosPromise } from "axios";

export function checkinApi(data: any): AxiosPromise {
  return request({
    url: "/checkin-record",
    method: "post",
    data,
  });
}
