import { PlannedDayResult } from '../../schema';
import { Response } from './RequestTypes';
import { PlannedDayResultSummary } from '../planned_day_result/PlannedDayResult';

export interface GetPlannedDayResultResponse extends Response {
  plannedDayResult?: PlannedDayResult;
}

export interface GetPlannedDayResultRequest {
  userId: number;
  dayKey: string;
}

export interface GetPlannedDayResultsResponse extends Response {
  plannedDayResults?: PlannedDayResult[];
}

export interface CreatePlannedDayResultRequest {
  plannedDayResult: PlannedDayResult;
}

export interface CreatePlannedDayResultResponse extends Response {
  plannedDayResult?: PlannedDayResult;
}

export interface UpdatePlannedDayResultRequest {
  plannedDayResult: PlannedDayResult;
}

export interface UpdatePlannedDayResultResponse extends Response {
  plannedDayResult?: PlannedDayResult;
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
