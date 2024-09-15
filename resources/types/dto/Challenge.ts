import {
    Role,
    Award as AwardSchema,
    Challenge,
    ChallengeParticipant,
    ChallengeRequirement,
    Task,
    Tag,
} from '../../schema';

interface ChallengeUser {
    id: number;
    uid: string;
    username: string;
    displayName: string;
    photoUrl: string;
    roles: Role[];
}

interface ChallengeComment {
    id: number;
    userId: number;
    comment: string;
    createdAt: Date;
    user: ChallengeUser;
}

interface ChallengeBase {
    id: number;
    name: string;
    description: string;
    award: Award;
    tag: Tag;
    likeCount: number;
    participantCount: number;

    start: Date;
    end: Date;
    timelineTimestamp: Date;

    isLiked: boolean;
    isParticipant: boolean;
    canJoin: boolean;
}

export interface Award {
    id: number;
    name: string;
    description: string;
    remoteImageUrl: string;
    localImage: string;
}

export interface ChallengeRecentlyJoined extends ChallengeSummary { }

export interface ChallengeSummary extends ChallengeBase {
    latestParticipant: ChallengeParticipant;
    commentCount: number;
}

export interface ChallengeDetails extends ChallengeBase {
    comments: ChallengeComment[];
}

export interface ChallengeFull {
    challenge: Pick<Challenge, 'name' | 'description' | 'start' | 'end'>;
    tag: Pick<Tag, 'id' | 'name' | 'color'>;
    award: Pick<AwardSchema, 'name' | 'description' | 'iconId'>;
    task: Pick<Task, 'title' | 'description' | 'iconId'>;
    challengeRequirement: Pick<
        ChallengeRequirement,
        | 'unitId'
        | 'calculationType'
        | 'calculationIntervalDays'
        | 'requiredIntervalQuantity'
        | 'requiredTaskQuantity'
    >;
    milestoneKeys: string[];
}
