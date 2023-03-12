import { TaskModel } from "../models/TaskModel";
import { Response } from "./RequestTypes";

export interface GetTaskResponse extends Response {
  task?: TaskModel;
}

export interface SearchTasksResponse extends Response {
  tasks: TaskModel[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface CreateTaskResponse extends Response {}
