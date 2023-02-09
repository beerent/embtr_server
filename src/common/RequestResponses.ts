export enum ReturnCode {
    SUCCESS = 200,

    //create account errors
    CREATE_USER_EMAIL_IN_USE = 409,
    CREATE_USER_INVALID_EMAIL = 400,
    CREATE_USER_INVALID_PASSWORD = 400,
    CREATE_USER_ERROR = 400,
}

export interface RequestResponse {
    code: ReturnCode;
    success: boolean;
    message: string;
}

export const SUCCESS: RequestResponse = {
    code: ReturnCode.SUCCESS,
    success: true,
    message: 'success',
};

export const CREATE_USER_EMAIL_IN_USE: RequestResponse = {
    code: ReturnCode.CREATE_USER_EMAIL_IN_USE,
    success: false,
    message: 'email already in use',
};

export const CREATE_USER_INVALID_EMAIL: RequestResponse = {
    code: ReturnCode.CREATE_USER_INVALID_EMAIL,
    success: false,
    message: 'invalid email address',
};

export const CREATE_USER_INVALID_PASSWORD: RequestResponse = {
    code: ReturnCode.CREATE_USER_INVALID_PASSWORD,
    success: false,
    message: 'invalid password',
};

export const CREATE_USER_ERROR: RequestResponse = {
    code: ReturnCode.CREATE_USER_ERROR,
    success: false,
    message: 'an error occured.',
};
