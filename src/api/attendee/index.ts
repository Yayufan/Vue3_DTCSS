import request from "@/utils/request";
import { AxiosPromise } from "axios";

export function getAttendeeListByTagAndPaginationApi(
  page: number,
  size: number,
  queryText: string
): AxiosPromise {
  return request({
    url: "/attendees/tag/pagination-by-query",
    method: "get",
    params: {
      page: page,
      size: size,
      queryText: queryText,
    },
  });
}

export function deleteAttendeeApi(id: number): AxiosPromise {
  return request({
    url: `/attendees/${id}`,
    method: "delete",
  });
}

export function batchDeleteAttendeesApi(data: any): AxiosPromise {
  return request({
    url: "/attendees",
    method: "delete",
    data,
  });
}

export function assignTagToAttendeeApi(data: any): AxiosPromise {
  return request({
    url: `/tag/attendees`,
    method: "put",
    data,
  });
}

export function downloadAttendeeExcelApi(): AxiosPromise {
  return request({
    url: "/attendees/download-excel",
    method: "get",
    responseType: "arraybuffer",
  });
}

export function insertAttendeeOnSiteApi(data: any): AxiosPromise {
  return request({
    url: "/attendees/on-site",
    method: "post",
    data,
  });
}


/**  臨時增加問卷Excel下載 */
export function downloadQuestionnaireExcelApi(): AxiosPromise {
  return request({
    url: "/questionnaire/download-excel",
    method: "get",
    responseType: "arraybuffer",
  });
}