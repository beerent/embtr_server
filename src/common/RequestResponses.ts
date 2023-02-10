import { Code } from '@resources/codes';
import { Response } from '@resources/types';

export enum HttpCode {
    SUCCESS = 200,

    //create account errors
    CREATE_USER_EMAIL_IN_USE = 409,
    CREATE_USER_INVALID_EMAIL = 400,
    CREATE_USER_INVALID_PASSWORD = 400,
    CREATE_USER_ERROR = 400,
}

export const SUCCESS: Response = {
    httpCode: HttpCode.SUCCESS,
    internalCode: Code.SUCCESS,
    success: true,
    message: 'success',
};

export const CREATE_USER_EMAIL_IN_USE: Response = {
    httpCode: HttpCode.CREATE_USER_EMAIL_IN_USE,
    internalCode: Code.CREATE_USER_EMAIL_IN_USE,
    success: false,
    message: 'email already in use',
};

export const CREATE_USER_INVALID_EMAIL: Response = {
    httpCode: HttpCode.CREATE_USER_INVALID_EMAIL,
    internalCode: Code.CREATE_USER_INVALID_EMAIL,
    success: false,
    message: 'invalid email address',
};

export const CREATE_USER_INVALID_PASSWORD: Response = {
    httpCode: HttpCode.CREATE_USER_INVALID_PASSWORD,
    internalCode: Code.CREATE_USER_INVALID_PASSWORD,
    success: false,
    message: 'invalid password',
};

export const CREATE_USER_ERROR: Response = {
    httpCode: HttpCode.CREATE_USER_ERROR,
    internalCode: Code.GENERIC_ERROR,
    success: false,
    message: 'an error occured.',
};
