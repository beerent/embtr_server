import { Challenge } from '@resources/schema';
import {
    ChallengeDetails,
    ChallengeRecentlyJoined,
    ChallengeSummary,
} from '@resources/types/dto/Challenge';
import { ChallengeTypesV3 } from '@src/endpoints/challenge/ChallengeRouterV3';

export class ChallengeTransformationServiceV3 {
    public static transformOutAllChallengeDetails(
        challengesDetails: ChallengeDetails[]
    ): ChallengeTypesV3.ChallengeDetailsV3[] {
        return challengesDetails.map((challengeDetails) =>
            this.transformOutChallengeDetails(challengeDetails)
        );
    }

    public static transformOutChallengeDetails(
        challengeDetails: ChallengeDetails
    ): ChallengeTypesV3.ChallengeDetailsV3 {
        const challengeReward: ChallengeTypesV3.ChallengeChallengeRewardV3 = {
            id: challengeDetails.award.id,
            name: challengeDetails.award.name,
            description: challengeDetails.award.description,
            remoteImageUrl: challengeDetails.award.remoteImageUrl,
            localImage: challengeDetails.award.localImage,
        };

        const transformedChallengeDetails: ChallengeTypesV3.ChallengeDetailsV3 = {
            ...challengeDetails,
            challengeRewards: [challengeReward],
        };

        return transformedChallengeDetails;
    }

    public static transformOutAllChallengeSummaries(
        challengeSummaries: ChallengeSummary[]
    ): ChallengeTypesV3.ChallengeSummaryV3[] {
        return challengeSummaries.map((challengeSummary) =>
            this.transformOutChallengeSummary(challengeSummary)
        );
    }

    public static transformOutChallengeSummary(
        challengeSummary: ChallengeSummary
    ): ChallengeTypesV3.ChallengeSummaryV3 {
        const challengeReward: ChallengeTypesV3.ChallengeChallengeRewardV3 = {
            id: challengeSummary.award.id,
            name: challengeSummary.award.name,
            description: challengeSummary.award.description,
            remoteImageUrl: challengeSummary.award.remoteImageUrl,
            localImage: challengeSummary.award.localImage,
        };

        const transformedChallengeSummary: ChallengeTypesV3.ChallengeSummaryV3 = {
            ...challengeSummary,
            challengeRewards: [challengeReward],
        };

        return transformedChallengeSummary;
    }

    public static transformOutChallengeRecentlyJoined(
        challengeRecentlyJoined: ChallengeRecentlyJoined
    ): ChallengeTypesV3.ChallengeRecentlyJoinedV3 {
        return this.transformOutChallengeSummary(challengeRecentlyJoined);
    }

    public static transformOut(challenge: Challenge): Challenge {
        if (!challenge.award) {
            return challenge;
        }

        challenge.challengeRewards = [
            {
                name: challenge.award.name ?? '',
                description: challenge.award.description ?? '',
                remoteImageUrl: challenge.award.icon?.remoteImageUrl ?? '',
                localImage: challenge.award.icon?.localImage ?? '',
                active: challenge.award.active ?? true,
                createdAt: challenge.award.createdAt ?? new Date(),
                updatedAt: challenge.award.updatedAt ?? new Date(),
            },
        ];

        return challenge;
    }
}
