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
