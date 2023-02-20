import { Code } from '@resources/codes';
import { AuthenticationResponse, Response } from '@resources/types';

export enum HttpCode {
    SUCCESS = 200,
    UNAUTHORIZED = 401,

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
    success: true,
    message: 'success',
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
 * SEMD VERIFICATION EMAIL
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
