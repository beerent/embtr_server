import { Task } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetTaskResponse extends Response {
    task?: Task;
}

export interface SearchTasksResponse extends Response {
    tasks: Task[];
}

export interface CreateTaskRequest {
    task: Task;
}

export interface CreateTaskResponse extends Response {
    task?: Task;
}

export interface TaskPreferenceRequest {
    unitId?: number;
    quantity?: number;
}
