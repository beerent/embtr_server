import { PlannedDay as PlannedDayModel } from "../schema";
import { Response } from "./RequestTypes";

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
