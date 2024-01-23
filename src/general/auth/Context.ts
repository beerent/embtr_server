import { Role } from '@src/roles/Roles';

export interface Context {
    userId: number;
    userUid: string;
    userEmail: string;
    userRoles: Role[];
}

export interface NewUserContext {
    userUid: string;
    userEmail: string;
}
