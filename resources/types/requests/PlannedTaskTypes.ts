import { Challenge, PlannedTask as PlannedTaskModel } from '../../schema';
import { Response } from './RequestTypes';

export interface GetPlannedHabitResponse extends Response {
  plannedHabit?: PlannedTaskModel;
}

export interface CreatePlannedTaskRequest {
  plannedTask: PlannedTaskModel;
}

export interface CreatePlannedTaskResponse extends Response {
  plannedTask?: PlannedTaskModel;
  completedChallenges?: Challenge[];
}

export interface UpdatePlannedTaskRequest {
  plannedTask: PlannedTaskModel;
}

export interface UpdatePlannedTaskResponse extends Response {
  plannedTask?: PlannedTaskModel;
  completedChallenges?: Challenge[];
}

export interface CreateOrReplacePlannedTaskRequest {
  plannedTask: PlannedTaskModel;
}

export interface CreateOrReplacePlannedTaskResponse extends Response {
  plannedTask?: PlannedTaskModel;
}

export interface GetPlannedHabitCountResponse extends Response {
  count?: number;
}
