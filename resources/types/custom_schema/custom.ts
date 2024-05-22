export interface ChallengeCustom {
    challengeRewards?: {
        id?: number;
        name?: string;
        description?: string;
        remoteImageUrl?: string;
        localImage?: string;
        active?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }[];
}

export interface PlannedTaskCustom {
    remoteImageUrl?: string;
    localImage?: string;
}

export interface TaskCustom {
    remoteImageUrl?: string;
    localImage?: string;
}

export interface ScheduledHabitCustom {
    remoteImageUrl?: string;
    localImage?: string;
}
