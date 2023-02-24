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
    user?: {
        uid: string;
        email: string;
    }
}

export interface CreateUserRequest {
}

export interface CreateUserResponse extends Response {
}
