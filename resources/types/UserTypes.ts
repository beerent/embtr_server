import { UserModel } from "../models/UserModel";
import { Response } from "./RequestTypes";

export interface GetUserResponse extends Response {
  user?: UserModel;
}

export interface CreateUserRequest {}

export interface CreateUserResponse extends Response {}

export interface UpdateUserRequest extends UserModel {}
