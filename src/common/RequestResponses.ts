export enum ReturnCode {
    SUCCESS = 200,

    //create account errors
    EMAIL_ALREADY_IN_USE = 409,
    INVALID_EMAIL = 400,
    INVALID_PASSWORD = 400,
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

export const EMAIL_ALREADY_IN_USE: RequestResponse = {
    code: ReturnCode.EMAIL_ALREADY_IN_USE,
    success: false,
    message: 'email already in use',
};

export const INVALID_EMAIL: RequestResponse = {
    code: ReturnCode.INVALID_EMAIL,
    success: false,
    message: 'invalid email address',
};

export const INVALID_PASSWORD: RequestResponse = {
    code: ReturnCode.INVALID_PASSWORD,
    success: false,
    message: 'invalid password',
};
