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
    user: ChallengeUser;
}

interface ChallengeChallengeReward {
    id: number;
    name: string;
    description: string;
    remoteImageUrl: string;
    localImage: string;
}

interface ChallengeBase {
    id: number;
    name: string;
    description: string;
    challengeRewards: ChallengeChallengeReward[];
    likeCount: number;
    participantCount: number;

    start: Date;
    end: Date;

    isLiked: boolean;
    isParticipant: boolean;
}

export interface ChallengeRecentlyJoined extends ChallengeSummary { }

export interface ChallengeSummary extends ChallengeBase {
    latestParticipant: ChallengeParticipant;
    commentCount: number;
}

export interface ChallengeDetails extends ChallengeBase {
    comments: ChallengeComment[];
}
