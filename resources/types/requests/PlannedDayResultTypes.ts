import { PlannedDayResult as PlannedDayResultModel } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetPlannedDayResultResponse extends Response {
  plannedDayResult?: PlannedDayResultModel;
}

export interface GetPlannedDayResultRequest {
  userId: number;
  dayKey: string;
}

export interface GetPlannedDayResultsResponse extends Response {
  plannedDayResults?: PlannedDayResultModel[];
}

export interface CreatePlannedDayResultRequest {
  plannedDayId: number;
}

export interface CreatePlannedDayResultResponse extends Response {
  plannedDayResult?: PlannedDayResultModel;
}

export interface UpdatePlannedDayResultRequest {
  plannedDayResult?: PlannedDayResultModel;
}

export interface UpdatePlannedDayResultResponse extends Response {
  plannedDayResult?: PlannedDayResultModel;
}
