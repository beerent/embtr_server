import { DayResultModel } from "../models/DayResultModel";
import { Response } from "./RequestTypes";

export interface GetDayResultResponse extends Response {
  dayResult?: DayResultModel
}

export interface GetDayResultRequest {
  userId: number,
  dayKey: string
}
