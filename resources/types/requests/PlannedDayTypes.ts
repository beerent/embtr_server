import { PlannedDay as PlannedDayModel } from '../../schema';
import { Response } from './RequestTypes';
import { PlannedDayCompletionStatus } from '../dto/PlannedDay';

export interface GetPlannedDayRequest {
  userId: number;
  dayKey: string;
}

export interface GetPlannedDayResponse extends Response {
  plannedDay?: PlannedDayModel;
}

export interface CreatePlannedDayRequest {
  dayKey: string;
}

export interface CreatePlannedDayResponse extends Response {
  plannedDay?: PlannedDayModel;
}

export interface GetPlannedDayCompletionStatusesResponse extends Response {
  plannedDayCompletionStatuses: PlannedDayCompletionStatus[];
}
