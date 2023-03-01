export interface UserModel {
    uid?: string;
    email?: string;
    displayName?: string;
    username?: string;
    location?: string;
    bio?: string;
}

export interface TaskModel {
    title?: string;
    description: string | null;
}

export interface PlannedDayModel {
    user?: UserModel;
    dayKey?: string;
    date?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
