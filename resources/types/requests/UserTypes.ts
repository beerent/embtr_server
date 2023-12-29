import { User as UserModel } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetUserResponse extends Response {
  user?: UserModel;
}

export interface GetUsersResponse extends Response {
  users?: UserModel[];
}

export interface CreateUserRequest {}

export interface CreateUserResponse extends Response {}

export interface UpdateUserRequest extends UserModel {}

export interface UpdateUserResponse extends Response {
  user?: UserModel;
}
