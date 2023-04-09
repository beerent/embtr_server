import { DailyHistory } from "../widget/DailyHistory";
import { Response } from "./RequestTypes";

export interface GetDailyHistoryRequest {
  start: Date,
  end: Date
}

export interface GetDailyHistoryResponse extends Response {
  dailyHistory?: DailyHistory
}
