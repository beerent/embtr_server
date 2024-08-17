import { Role } from '@src/roles/Roles';

export interface Context {
    type: ContextType;
    userId: number;
    userUid: string;
    userEmail: string;
    userRoles: Role[];
    dayKey: string;
    timeZone: string;
    dateTime: Date;
    isAdmin: boolean;
}

export interface NewUserContext {
    type: ContextType;
    userUid: string;
    userEmail: string;
}

export interface UserContext extends Context {
    isUser: true;
}

export interface AdminContext extends Context {
    isAdmin: true;
}

export interface JobContext extends Context {
    isAdmin: true;
    isJob: true;
}

export enum ContextType {
    CONTEXT,
    USER_CONTEXT,
    NEW_USER_CONTEXT,
    JOB_CONTEXT,
    ADMIN_CONTEXT,
}
