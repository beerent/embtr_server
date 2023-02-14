import { Code } from './codes';
export interface CreateUserRequest {
    email: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string
}

export interface Response {
    httpCode: number;
    internalCode: Code;
    success: boolean;
    message: string;
}
