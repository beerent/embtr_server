import { PlannedDayResult as PlannedDayResultModel } from "../../schema";
import { Response } from "./RequestTypes";
import { PlannedDayResultSummary } from "../planned_day_result/PlannedDayResult"

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

export interface GetPlannedDayResultSummariesResponse extends Response {
  plannedDayResultSummaries?: PlannedDayResultSummary[];
}

export interface GetPlannedDayResultSummariesRequest {
  userId: number;
  dayKey: string;
}

export interface GetPlannedDayResultSummaryResponse extends Response {
  plannedDayResultSummary?: PlannedDayResultSummary;
}
