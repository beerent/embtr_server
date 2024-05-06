import { ChallengeParticipant } from '../../schema';

interface ChallengeUser {
    id: number;
    uid: string;
    username: string;
    displayName: string;
    photoUrl: string;
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
    likeCount: number;
    participantCount: number;

    start: Date;
    end: Date;
    timelineTimestamp: Date;

    isLiked: boolean;
    isParticipant: boolean;
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
