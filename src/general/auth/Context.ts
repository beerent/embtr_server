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
}

export interface NewUserContext {
    type: ContextType;
    userUid: string;
    userEmail: string;
}

export enum ContextType {
    CONTEXT,
    NEW_USER_CONTEXT,
    JOB_CONTEXT,
}
