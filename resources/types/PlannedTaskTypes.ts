import { PlannedTaskModel } from '../models/PlannedTaskModel';
import { Response } from './RequestTypes';

export interface CreatePlannedTaskRequest {
    taskId: number;
    plannedDayId: number;
}

export interface UpdatePlannedTaskRequest {
    plannedTask: PlannedTaskModel;
}

export interface UpdatePlannedTaskResponse extends Response {
    plannedTask?: PlannedTaskModel;
}
