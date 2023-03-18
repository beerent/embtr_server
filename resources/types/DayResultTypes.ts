import { DayResultModel } from "../models/DayResultModel";
import { Response } from "./RequestTypes";

export interface GetDayResultResponse extends Response {
  dayResult?: DayResultModel
}

export interface GetDayResultRequest {
  userId: number,
  dayKey: string
}

export interface GetDayResultsResponse extends Response {
  dayResults?: DayResultModel[]
}

export interface CreateDayResultRequest {
  plannedDayId: number,
};

export interface CreateDayResultResponse extends Response {
  dayResult?: DayResultModel
}
