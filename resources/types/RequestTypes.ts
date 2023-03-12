import { Code } from "../codes";

export interface AuthenticationRequest {
  email: string;
  password: string;
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
