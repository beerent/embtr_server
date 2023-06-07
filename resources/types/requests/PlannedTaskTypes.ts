import { PlannedTask as PlannedTaskModel } from "../../schema";
import { Response } from "./RequestTypes";

export interface CreatePlannedTaskRequest {
  taskId: number;
  plannedDayId: number;
  habitId?: number;
  quantity?: number;
  unitId?: number;
}

export interface UpdatePlannedTaskRequest {
  plannedTask: PlannedTaskModel;
}

export interface UpdatePlannedTaskResponse extends Response {
  plannedTask?: PlannedTaskModel;
}
