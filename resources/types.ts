import { Code } from './codes';
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

export interface Response {
    httpCode: number;
    internalCode: Code;
    success: boolean;
    message: string;
}
