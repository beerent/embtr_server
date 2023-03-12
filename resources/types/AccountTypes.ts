export interface CreateAccountRequest {
  email: string;
  password: string;
}

export interface ForgotAccountPasswordRequest {
  email: string;
}

export interface VerifyAccountEmailRequest {
  email: string;
}

export interface GetAccountRequest {
  uid: string;
}
