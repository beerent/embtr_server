import { Property, User as UserModel } from '../../schema';
import { Response } from './RequestTypes';
import { NewUserChecklist } from '../dto/NewUserChecklist';

export interface GetUserResponse extends Response {
    user?: UserModel;
}

export interface GetUsersResponse extends Response {
    users?: UserModel[];
}

export interface GetUserStatsResponse extends Response {
  totalUsers: number
  premiumUsers: number
}

export interface CreateUserRequest { }

export interface CreateUserResponse extends Response {
    user?: UserModel;
}

export interface UpdateUserRequest {
    user: UserModel;
}

export interface UpdateUserResponse extends Response {
    user?: UserModel;
}

export interface CreateBlockUserRequest {
    userId: number;
}

export interface UpdatePremiumStatusResponse extends Response {
    user?: UserModel;
}

export interface GetPropertyResponse extends Response {
    property?: Property;
}

export interface GetPropertiesResponse extends Response {
    properties?: Property[];
}

export interface CreatePropertyRequest {
    property: Property;
}

export interface CreatePropertyResponse extends Response {
    property?: Property;
}

export interface GetNewUserChecklistResponse extends Response {
    checklist?: NewUserChecklist;
}
