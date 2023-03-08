import { Code } from './codes';
import { UserModel, TaskModel, PlannedDayModel } from './models';

export interface CreateAccountRequest {
    email: string;
    password: string;
}

export interface ForgotAccountPasswordRequest {
    email: string
}

export interface VerifyAccountEmailRequest {
    email: string
}

export interface GetAccountRequest {
    uid: string
}

export interface AuthenticationRequest {
    email: string,
    password: string
}

export interface Response {
    httpCode: number;
    internalCode: Code;
    success: boolean;
    message: string;
}

export interface AuthenticationResponse extends Response {
    token?: string;
}

export interface GetUserResponse extends Response {
    user?: UserModel
}

export interface CreateUserRequest {
}

export interface CreateUserResponse extends Response {
}

export interface UpdateUserRequest extends UserModel {
}

export interface GetTaskResponse extends Response {
    task?: TaskModel
}

export interface SearchTasksResponse extends Response {
    tasks: TaskModel[]
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
}

export interface CreateTaskResponse extends Response {

}

export interface GetPlannedDayRequest {
    userId: number;
    dayKey: string;
}

export interface GetPlannedDayResponse extends Response {
    plannedDay?: PlannedDayModel
}

export interface CreatePlannedDayRequest {
    dayKey: string;
}

export interface CreatePlannedDayResponse extends Response {
}

export interface CreatePlannedTaskRequest {
    taskId: number,
    plannedDayId: number
}
