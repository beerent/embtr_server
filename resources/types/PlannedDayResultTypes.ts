import { PlannedDayResultModel } from "../models/PlannedDayResultModel";
import { Response } from "./RequestTypes";

export interface GetPlannedDayResultResponse extends Response {
  dayResult?: PlannedDayResultModel;
}

export interface GetPlannedDayResultRequest {
  userId: number;
  dayKey: string;
}

export interface GetPlannedDayResultsResponse extends Response {
  dayResults?: PlannedDayResultModel[];
}

export interface CreatePlannedDayResultRequest {
  plannedDayId: number;
}

export interface CreatePlannedDayResultResponse extends Response {
  dayResult?: PlannedDayResultModel;
}
