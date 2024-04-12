import { Code } from '@resources/codes';
import {
    Challenge,
    ChallengeCalculationType,
    ChallengeParticipant,
    ChallengeRequirement,
    ChallengeRequirementCompletionState,
    PlannedTask,
} from '@resources/schema';
import { ChallengeDetails, ChallengeSummary } from '@resources/types/dto/Challenge';
import { GetChallengeParticipationResponse } from '@resources/types/requests/ChallengeTypes';
import { GENERAL_FAILURE, HttpCode, SUCCESS } from '@src/common/RequestResponses';
import { ChallengeDao, ChallengeRequirementResults } from '@src/database/ChallengeDao';
import { ChallengeParticipantDao } from '@src/database/ChallengeParticipantDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ScheduledHabitService } from './ScheduledHabitService';

export class ChallengeService {
    public static async getSummary(context: Context, id: number): Promise<ChallengeSummary> {
        const challenge = await this.get(context, id);
        const challengeSummary = this.getSummaryFromChallenge(context, challenge);

        return challengeSummary;
    }

    public static async getAllSummaries(context: Context): Promise<ChallengeSummary[]> {
        const challenges = await this.getAll(context);
        const challengeSummaries: ChallengeSummary[] = [];
        for (const challenge of challenges) {
            const challengeSummary = this.getSummaryFromChallenge(context, challenge);
            challengeSummaries.push(challengeSummary);
        }

        return challengeSummaries;
    }

    public static async getDetails(context: Context, id: number): Promise<ChallengeDetails> {
        const challenge = await this.get(context, id);
        const challengeDetails = this.getDetailsFromChallenge(context, challenge);

        return challengeDetails;
    }

    public static async getAllDetails(context: Context): Promise<ChallengeDetails[]> {
        const challenges = await this.getAll(context);
        const allChallengeDetails: ChallengeDetails[] = [];
        for (const challenge of challenges) {
            const challengeDetails = this.getDetailsFromChallenge(context, challenge);
            allChallengeDetails.push(challengeDetails);
        }

        return allChallengeDetails;
    }

    public static async getAll(context: Context): Promise<Challenge[]> {
        const challenges = await ChallengeDao.getAll();
        const challengeModels: Challenge[] = ModelConverter.convertAll(challenges);

        return challengeModels;
    }

    public static async getAllByIds(context: Context, ids: number[]): Promise<Challenge[]> {
        const challenges = await ChallengeDao.getAllByIds(ids);
        const challengeModels: Challenge[] = ModelConverter.convertAll(challenges);

        return challengeModels;
    }

    public static async get(context: Context, id: number): Promise<Challenge> {
        const challenge = await ChallengeDao.get(id);
        if (!challenge) {
            throw new ServiceException(
                HttpCode.RESOURCE_NOT_FOUND,
                Code.RESOURCE_NOT_FOUND,
                'challenge not found'
            );
        }

        const challengeModel: Challenge = ModelConverter.convert(challenge);
        return challengeModel;
    }

    public static async getAllParticipantsByIds(
        context: Context,
        ids: number[]
    ): Promise<ChallengeParticipant[]> {
        const challengeParticipants = await ChallengeParticipantDao.getAllByIds(ids);
        const challengeParticipantModels: ChallengeParticipant[] =
            ModelConverter.convertAll(challengeParticipants);

        return challengeParticipantModels;
    }

    public static async getAllRecentlyJoinedByParticipantIds(
        context: Context,
        participantIds: number[]
    ): Promise<ChallengeSummary[]> {
        const challengeParticipants = await this.getAllParticipantsByIds(context, participantIds);

        const challengeIds = challengeParticipants.flatMap((challengeParticipant) => [
            challengeParticipant.challengeId ?? 0,
        ]);
        const challenges = await this.getAllByIds(context, challengeIds);

        const challengeSummaries: ChallengeSummary[] = [];
        for (const challengeParticipant of challengeParticipants) {
            const challenge = challenges.find(
                (challenge) => challenge.id === challengeParticipant.challengeId
            );
            if (!challenge) {
                continue;
            }

            const existingMapping = challengeSummaries.find((challengeSummary) => {
                return challengeSummary.id === challengeParticipant.challengeId;
            });

            if (existingMapping) {
                existingMapping.participantCount += 1;
                if (
                    (existingMapping.latestParticipant?.createdAt ?? new Date()) >
                    (challengeParticipant.createdAt ?? new Date())
                ) {
                    existingMapping.latestParticipant = challengeParticipant;
                }
            } else {
                const challengeSummary = this.getSummaryFromChallenge(context, challenge);
                challengeSummary.latestParticipant = challengeParticipant;
                challengeSummary.participantCount = 1;

                challengeSummaries.push(challengeSummary);
            }
        }

        return challengeSummaries;
    }

    public static async getChallengeParticipationForUser(
        userId: number
    ): Promise<GetChallengeParticipationResponse> {
        const challengeParticipation = await ChallengeParticipantDao.getAllForUser(userId);
        const models: ChallengeParticipant[] = ModelConverter.convertAll(challengeParticipation);

        return { ...SUCCESS, challengeParticipation: models };
    }

    public static async getActiveChallengeParticipationForUser(
        userId: number
    ): Promise<GetChallengeParticipationResponse> {
        const challengeParticipation = await ChallengeParticipantDao.getAllActiveForUser(userId);
        const models: ChallengeParticipant[] = ModelConverter.convertAll(challengeParticipation);

        return { ...SUCCESS, challengeParticipation: models };
    }

    public static async getCompletedChallengesForUser(
        userId: number
    ): Promise<GetChallengeParticipationResponse> {
        const challengeParticipation = await ChallengeParticipantDao.getAllForUser(
            userId,
            ChallengeRequirementCompletionState.COMPLETED
        );
        const models: ChallengeParticipant[] = ModelConverter.convertAll(challengeParticipation);

        return { ...SUCCESS, challengeParticipation: models };
    }

    public static async register(context: Context, id: number) {
        const challenge = await this.get(context, id);

        //todo - use query, don't be a moron
        if (
            challenge?.challengeParticipants?.some(
                (participant) => participant.userId === context.userId
            )
        ) {
            // throw exception here
            return { ...GENERAL_FAILURE, message: 'user already registered for challenge' };
        }

        await ChallengeDao.register(context.userId, id);
        await ScheduledHabitService.createFromChallenge(context, challenge);

        return SUCCESS;
    }

    public static async updateChallengeRequirementProgress(
        plannedTask: PlannedTask
    ): Promise<Challenge[]> {
        const userId = plannedTask.plannedDay?.userId;
        const taskId = plannedTask.scheduledHabit?.taskId;
        const date = plannedTask.plannedDay?.date;
        if (!userId || !taskId || !date) {
            return [];
        }

        const completedChallenges = [];

        const participants = await ChallengeParticipantDao.getAllForUserAndTaskAndDate(
            userId,
            taskId ?? 0,
            date
        );
        const participantModels: ChallengeParticipant[] = ModelConverter.convertAll(participants);

        const promises = [];
        for (const participant of participantModels) {
            if (!participant.challenge?.challengeRequirements) {
                continue;
            }

            const previousCompletionState = participant.challengeRequirementCompletionState;

            const challenge = participant.challenge;
            const requirements = challenge.challengeRequirements!.filter((requirement) => {
                return requirement.taskId === taskId;
            });

            for (const requirement of requirements) {
                const amountComplete = await ChallengeService.getChallengeRequirementAmountComplete(
                    userId,
                    challenge,
                    requirement
                );

                participant.amountComplete = amountComplete;
                const reqiredAmount =
                    requirement.calculationType === ChallengeCalculationType.TOTAL
                        ? requirement.requiredTaskQuantity
                        : requirement.requiredIntervalQuantity;

                const challengeIsComplete = amountComplete >= (reqiredAmount ?? 0);
                if (challengeIsComplete) {
                    const challengeWasNotComplete =
                        participant.challengeRequirementCompletionState !==
                        ChallengeRequirementCompletionState.COMPLETED;
                    if (challengeWasNotComplete) {
                        participant.completedOnPlannedDayId = plannedTask.plannedDay?.id;
                    }
                    participant.challengeRequirementCompletionState =
                        ChallengeRequirementCompletionState.COMPLETED;
                } else {
                    participant.challengeRequirementCompletionState =
                        ChallengeRequirementCompletionState.IN_PROGRESS;
                }

                participant.challengeRequirementCompletionState =
                    amountComplete >= (reqiredAmount ?? 0)
                        ? ChallengeRequirementCompletionState.COMPLETED
                        : ChallengeRequirementCompletionState.IN_PROGRESS;

                promises.push(ChallengeParticipantDao.update(participant));

                if (
                    previousCompletionState !== participant.challengeRequirementCompletionState &&
                    participant.challengeRequirementCompletionState ===
                    ChallengeRequirementCompletionState.COMPLETED
                ) {
                    completedChallenges.push(challenge);
                }
            }
        }
        await Promise.all(promises);

        return completedChallenges;
    }

    public static async getChallengeRequirementAmountComplete(
        userId: number,
        challenge: Challenge,
        requirement: ChallengeRequirement
    ): Promise<number> {
        const start = challenge.start ?? new Date();
        const end = challenge.end ?? new Date();
        const daysInDateRange = Math.floor(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        const interval = requirement.calculationIntervalDays ?? daysInDateRange;

        let taskId: number | undefined = undefined;
        if (requirement.taskId) {
            taskId = requirement.taskId;
        }

        const results: ChallengeRequirementResults[] =
            await ChallengeDao.getChallengeRequirementProgess(start, end, userId, interval, taskId);

        let amountComplete = 0;

        if (requirement.calculationType === ChallengeCalculationType.TOTAL) {
            const result: ChallengeRequirementResults = results[0];

            amountComplete = result?.totalCompleted ?? 0;
        } else if (requirement.calculationType === ChallengeCalculationType.UNIQUE) {
            amountComplete = results.filter(
                (result) => result.totalCompleted >= requirement.requiredTaskQuantity!
            ).length;
        }

        return amountComplete;
    }

    private static getSummaryFromChallenge(
        context: Context,
        challenge: Challenge
    ): ChallengeSummary {
        const challengeSummary: ChallengeSummary = {
            id: challenge.id ?? 0,
            name: challenge.name ?? '',
            description: challenge.description ?? '',
            challengeRewards:
                challenge.challengeRewards?.map((reward) => {
                    return {
                        id: reward.id ?? 0,
                        name: reward.name ?? '',
                        description: reward.description ?? '',
                        remoteImageUrl: reward.remoteImageUrl ?? '',
                        localImage: reward.localImage ?? '',
                    };
                }) ?? [],
            likeCount: challenge.likes?.length ?? 0,
            participantCount: challenge.challengeParticipants?.length ?? 0,
            start: challenge.start ?? new Date(),
            end: challenge.end ?? new Date(),
            isLiked: challenge.likes?.some((like) => like.userId === context.userId) ?? false,
            isParticipant:
                challenge.challengeParticipants?.some(
                    (participant) => participant.userId === context.userId
                ) ?? false,
            commentCount: challenge.comments?.length ?? 0,
            latestParticipant: challenge.challengeParticipants![0],
        };

        return challengeSummary;
    }

    private static getDetailsFromChallenge(
        context: Context,
        challenge: Challenge
    ): ChallengeDetails {
        const challengeDetails: ChallengeDetails = {
            id: challenge.id ?? 0,
            name: challenge.name ?? '',
            description: challenge.description ?? '',

            challengeRewards:
                challenge.challengeRewards?.map((reward) => {
                    return {
                        id: reward.id ?? 0,
                        name: reward.name ?? '',
                        description: reward.description ?? '',
                        remoteImageUrl: reward.remoteImageUrl ?? '',
                        localImage: reward.localImage ?? '',
                    };
                }) ?? [],

            likeCount: challenge.likes?.length ?? 0,
            participantCount: challenge.challengeParticipants?.length ?? 0,
            start: challenge.start ?? new Date(),
            end: challenge.end ?? new Date(),
            isLiked: challenge.likes?.some((like) => like.userId === context.userId) ?? false,
            isParticipant:
                challenge.challengeParticipants?.some(
                    (participant) => participant.userId === context.userId
                ) ?? false,
            comments:
                challenge.comments?.map((comment) => {
                    return {
                        id: comment.id ?? 0,
                        comment: comment.comment ?? '',
                        userId: comment.userId ?? 0,
                        user: {
                            id: comment.user?.id ?? 0,
                            uid: comment.user?.uid ?? '',
                            username: comment.user?.username ?? '',
                            displayName: comment.user?.displayName ?? '',
                            photoUrl: comment.user?.photoUrl ?? '',
                        },
                    };
                }) ?? [],
        };

        return challengeDetails;
    }
}
