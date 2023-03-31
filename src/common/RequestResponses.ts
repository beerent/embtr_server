import { Code } from '@resources/codes';

import { AuthenticationResponse, Response } from '@resources/types/RequestTypes';
import { GetPlannedDayResponse, CreatePlannedDayResponse } from '@resources/types/PlannedDayTypes';
import { CreateTaskResponse, GetTaskResponse, SearchTasksResponse } from '@resources/types/TaskTypes';
import { CreateUserResponse, GetUserResponse } from '@resources/types/UserTypes';
import { UpdatePlannedTaskResponse } from '@resources/types/PlannedTaskTypes';
import {
    CreatePlannedDayResultCommentResponse,
    CreatePlannedDayResultResponse,
    GetPlannedDayResultResponse,
    UpdatePlannedDayResultResponse,
} from '@resources/types/PlannedDayResultTypes';

export enum HttpCode {
    SUCCESS = 200,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    RESOURCE_NOT_FOUND = 404,
    RESOURCE_ALREADY_EXISTS = 409,
    GENERAL_FAILURE = 400,

    //create account errors
    CREATE_ACCOUNT_EMAIL_IN_USE = 409,
    CREATE_ACCOUNT_INVALID_EMAIL = 400,
    CREATE_ACCOUNT_INVALID_PASSWORD = 400,
    CREATE_ACCOUNT_ERROR = 400,

    FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL = 400,
    FORGOT_ACCOUNT_PASSWORD_UNKNOWN_EMAIL = 400,

    SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL = 400,
    SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL = 400,
    SEND_ACCOUNT_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS = 400,

    ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS = 400,

    USER_CREATE_FAILED = 400,
    USER_CREATE_ALREADY_EXISTS = 409,
    USER_UPDATE_FAILED = 400,

    TASK_CREATE_FAILED_ALREADY_EXISTS = 409,
    TASK_CREATE_FAILED_MISSING_REQUIREMENTS = 400,
    TASK_CREATE_SUCCESS = 200,
}

export const SUCCESS: Response = {
    httpCode: HttpCode.SUCCESS,
    internalCode: Code.SUCCESS,
    success: true,
    message: 'success',
};

export const UNAUTHORIZED: Response = {
    httpCode: HttpCode.UNAUTHORIZED,
    internalCode: Code.UNAUTHORIZED,
    success: false,
    message: 'unauthorized',
};

export const FORBIDDEN: Response = {
    httpCode: HttpCode.FORBIDDEN,
    internalCode: Code.FORBIDDEN,
    success: false,
    message: 'access forbidden',
};

export const RESOURCE_NOT_FOUND: Response = {
    httpCode: HttpCode.RESOURCE_NOT_FOUND,
    internalCode: Code.RESOURCE_NOT_FOUND,
    success: false,
    message: 'resource not found',
};

export const RESOURCE_ALREADY_EXISTS: Response = {
    httpCode: HttpCode.RESOURCE_ALREADY_EXISTS,
    internalCode: Code.RESOURCE_ALREADY_EXISTS,
    success: false,
    message: 'resource not found',
};

export const INVALID_REQUEST: Response = {
    httpCode: HttpCode.GENERAL_FAILURE,
    internalCode: Code.INVALID_REQUEST,
    success: false,
    message: 'invalid request',
};

export const GENERAL_FAILURE: Response = {
    httpCode: HttpCode.GENERAL_FAILURE,
    internalCode: Code.CREATE_PLANNED_DAY_FAILED,
    success: false,
    message: 'a failure occured',
};

/*
 * Create User
 */
export const CREATE_ACCOUNT_EMAIL_IN_USE: Response = {
    httpCode: HttpCode.CREATE_ACCOUNT_EMAIL_IN_USE,
    internalCode: Code.CREATE_ACCOUNT_EMAIL_IN_USE,
    success: false,
    message: 'email already in use',
};

export const CREATE_ACCOUNT_INVALID_EMAIL: Response = {
    httpCode: HttpCode.CREATE_ACCOUNT_INVALID_EMAIL,
    internalCode: Code.CREATE_ACCOUNT_INVALID_EMAIL,
    success: false,
    message: 'invalid email address',
};

export const CREATE_ACCOUNT_INVALID_PASSWORD: Response = {
    httpCode: HttpCode.CREATE_ACCOUNT_INVALID_PASSWORD,
    internalCode: Code.CREATE_ACCOUNT_INVALID_PASSWORD,
    success: false,
    message: 'invalid password',
};

export const CREATE_ACCOUNT_ERROR: Response = {
    httpCode: HttpCode.CREATE_ACCOUNT_ERROR,
    internalCode: Code.GENERIC_ERROR,
    success: false,
    message: 'an error occured.',
};

/*
 * Forgot Password
 */

export const FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL: Response = {
    httpCode: HttpCode.FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL,
    internalCode: Code.FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL,
    success: false,
    message: 'invalid email address',
};

export const FORGOT_ACCOUNT_PASSWORD_UNKNOWN_EMAIL: Response = {
    httpCode: HttpCode.FORGOT_ACCOUNT_PASSWORD_UNKNOWN_EMAIL,
    internalCode: Code.FORGOT_ACCOUNT_PASSWORD_UNKNOWN_EMAIL,
    success: false,
    message: 'unknown email address',
};

/*
 * SEND VERIFICATION EMAIL
 */

export const SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL: Response = {
    httpCode: HttpCode.SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL,
    internalCode: Code.SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL,
    success: false,
    message: 'invalid email address',
};

export const SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL: Response = {
    httpCode: HttpCode.SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL,
    internalCode: Code.SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL,
    success: false,
    message: 'unknown email address',
};

export const SEND_ACCOUNT_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS: Response = {
    httpCode: HttpCode.SEND_ACCOUNT_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS,
    internalCode: Code.SEND_ACCOUNT_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS,
    success: false,
    message: 'too many verify email attempts',
};

/*
 * ACCOUNT AUTHENTICATION
 */
export const ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS: AuthenticationResponse = {
    httpCode: HttpCode.ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS,
    internalCode: Code.ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS,
    success: false,
    message: 'invalid username/password',
};

export const ACCOUNT_AUTHENTICATION_SUCCESS: AuthenticationResponse = {
    ...SUCCESS,
};

/*
 * USER
 */
export const GET_USER_SUCCESS: GetUserResponse = {
    ...SUCCESS,
};

export const GET_USER_FAILED_NOT_FOUND: GetUserResponse = {
    ...RESOURCE_NOT_FOUND,
};

export const CREATE_USER_FAILED: Response = {
    httpCode: HttpCode.USER_CREATE_FAILED,
    internalCode: Code.USER_CREATE_FAILED,
    success: false,
    message: 'failed to create user',
};

export const CREATE_USER_ALREADY_EXISTS: Response = {
    httpCode: HttpCode.USER_CREATE_ALREADY_EXISTS,
    internalCode: Code.USER_CREATE_ALREADY_EXISTS,
    success: false,
    message: 'user already exists',
};

export const CREATE_USER_SUCCESS: CreateUserResponse = {
    ...SUCCESS,
};

export const UPDATE_USER_FAILED: Response = {
    httpCode: HttpCode.USER_UPDATE_FAILED,
    internalCode: Code.USER_UPDATE_FAILED,
    success: false,
    message: 'failed to update user',
};

/*
 * TASK
 */

export const GET_TASK_FAILED_NOT_FOUND: GetTaskResponse = {
    ...RESOURCE_NOT_FOUND,
};

export const GET_TASK_SUCCESS: GetTaskResponse = {
    ...SUCCESS,
};

export const CREATE_TASK_FAILED_ALREADY_EXISTS: Response = {
    httpCode: HttpCode.TASK_CREATE_FAILED_ALREADY_EXISTS,
    internalCode: Code.TASK_CREATE_FAILED_ALREADY_EXISTS,
    success: false,
    message: 'task already exists',
};

export const CREATE_TASK_FAILED: Response = {
    ...GENERAL_FAILURE,
    message: 'failed to create task',
};

export const CREATE_TASK_SUCCESS: CreateTaskResponse = {
    ...SUCCESS,
};

export const SEARCH_TASKS_SUCCESS: SearchTasksResponse = {
    ...SUCCESS,
    tasks: [],
};

export const SEARCH_TASKS_FAILED: SearchTasksResponse = {
    ...GENERAL_FAILURE,
    message: 'invalid search parameters',
    tasks: [],
};

/*
 * PLANNED DAY
 */

export const GET_PLANNED_DAY_FAILED_NOT_FOUND: GetPlannedDayResponse = {
    ...RESOURCE_NOT_FOUND,
};

export const GET_PLANNED_DAY_SUCCESS: GetPlannedDayResponse = {
    ...SUCCESS,
};

export const CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS: Response = {
    ...RESOURCE_ALREADY_EXISTS,
    message: 'planned day already exists',
};

export const CREATE_PLANNED_DAY_SUCCESS: CreatePlannedDayResponse = {
    ...SUCCESS,
};

export const CREATE_PLANNED_DAY_FAILED: CreatePlannedDayResponse = {
    ...GENERAL_FAILURE,
    message: 'failed to create planned day',
};

export const CREATE_PLANNED_TASK_FAILED: CreatePlannedDayResponse = {
    ...GENERAL_FAILURE,
    message: 'failed to create planned task',
};

export const CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY: CreatePlannedDayResponse = {
    ...GENERAL_FAILURE,
    message: 'failed to create planned task. unknown planned day.',
};

export const CREATE_PLANNED_TASK_UNKNOWN_TASK: CreatePlannedDayResponse = {
    ...GENERAL_FAILURE,
    message: 'failed to create planned task. unknown task.',
};

export const UPDATE_PLANNED_TASK_FAILED: UpdatePlannedTaskResponse = {
    ...GENERAL_FAILURE,
    message: 'failed to updated planned task',
};

export const UPDATE_PLANNED_DAY_RESULT_INVALID: UpdatePlannedDayResultResponse = {
    ...GENERAL_FAILURE,
    message: 'invalid request',
};

export const UPDATE_PLANNED_DAY_RESULT_UNKNOWN: UpdatePlannedDayResultResponse = {
    ...GENERAL_FAILURE,
    message: 'failed to update planned day result. unknown planned day.',
};

export const GET_DAY_RESULT_INVALID: GetPlannedDayResultResponse = {
    ...GENERAL_FAILURE,
    message: 'invalid request',
};

export const GET_DAY_RESULT_UNKNOWN: GetPlannedDayResultResponse = {
    ...GENERAL_FAILURE,
    message: 'unknown day result',
};

export const GET_DAY_RESULT_FAILED: GetPlannedDayResultResponse = {
    ...GENERAL_FAILURE,
    message: 'get day result failed',
};

export const GET_DAY_RESULTS_SUCCESS: GetPlannedDayResultResponse = {
    ...SUCCESS,
};

export const GET_DAY_RESULTS_FAILED: GetPlannedDayResultResponse = {
    ...GENERAL_FAILURE,
    message: 'get day results failed',
};

export const GET_DAY_RESULT_SUCCESS: GetPlannedDayResultResponse = {
    ...SUCCESS,
};

export const CREATE_DAY_RESULT_INVALID: CreatePlannedDayResultResponse = {
    ...GENERAL_FAILURE,
    message: 'invalid request',
};

export const CREATE_DAY_RESULT_FAILED: CreatePlannedDayResultResponse = {
    ...GENERAL_FAILURE,
    message: 'failed to create day result',
};

export const CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID: CreatePlannedDayResultCommentResponse = {
    ...GENERAL_FAILURE,
    message: 'invalid comment request',
};

export const CREATE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN: CreatePlannedDayResultCommentResponse = {
    ...RESOURCE_NOT_FOUND,
    message: 'unknown planned day result',
};

export const CREATE_PLANNED_DAY_RESULT_COMMENT_FAILED: CreatePlannedDayResultCommentResponse = {
    ...GENERAL_FAILURE,
    message: 'failed comment request',
};

export const CREATE_PLANNED_DAY_RESULT_COMMENT_SUCCESS: CreatePlannedDayResultCommentResponse = {
    ...SUCCESS,
};

export const DELETE_PLANNED_DAY_RESULT_COMMENT_INVALID: CreatePlannedDayResultCommentResponse = {
    ...GENERAL_FAILURE,
    message: 'invalid delete request',
};

export const DELETE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN: CreatePlannedDayResultCommentResponse = {
    ...RESOURCE_NOT_FOUND,
    message: 'comment not found',
};

export const CREATE_PLANNED_DAY_RESULT_LIKE_FAILED: CreatePlannedDayResultCommentResponse = {
    ...GENERAL_FAILURE,
    message: 'failed like request',
};
