export interface UserModel {
    id?: number,
    uid?: string;
    email?: string;
    displayName?: string;
    username?: string;
    location?: string;
    bio?: string;
}

export interface TaskModel {
    id?: number,
    title?: string;
    description: string | null;
}

export interface PlannedTaskModel {
    id?: number,
    plannedDay?: PlannedDayModel,
    task?: TaskModel
}

export interface PlannedDayModel {
    id?: number,
    user?: UserModel;
    dayKey?: string;
    date?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    plannedTasks?: PlannedTaskModel[]
}
