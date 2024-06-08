import { Code } from '@resources/codes';
import {
    Challenge,
    ChallengeCalculationType,
    ChallengeParticipant,
    ChallengeRequirement,
    ChallengeRequirementCompletionState,
    PlannedTask,
} from '@resources/schema';
import { ChallengeDetails, ChallengeFull, ChallengeSummary } from '@resources/types/dto/Challenge';
import { GetChallengeParticipationResponse } from '@resources/types/requests/ChallengeTypes';
import { HttpCode, SUCCESS } from '@src/common/RequestResponses';
import { ChallengeDao, ChallengeRequirementResults } from '@src/database/ChallengeDao';
import { ChallengeParticipantDao } from '@src/database/ChallengeParticipantDao';
import { ChallengeEventDispatcher } from '@src/event/challenge/ChallengeEventDispatcher';
import { ChallengeParticipantEventDispatcher } from '@src/event/challenge_participant/ChallengeParticipantEventDispatcher';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { AwardService } from './AwardService';
import { HabitService } from './HabitService';
import { PlannedHabitService } from './PlannedHabitService';
import { ScheduledHabitService } from './ScheduledHabitService';

export class ChallengeService {
    public static async getSummary(context: Context, id: number): Promise<ChallengeSummary> {
        const challenge = await this.get(context, id);
        const challengeSummary = this.getSummaryFromChallenge(context, challenge);

        return challengeSummary;
    }

    public static async getAllSummaries(context: Context): Promise<ChallengeSummary[]> {
        const challenges = await this.getAllOpen(context);
        const challengeSummaries: ChallengeSummary[] = [];
        for (const challenge of challenges) {
            const challengeSummary = this.getSummaryFromChallenge(context, challenge);
            challengeSummaries.push(challengeSummary);
        }

        challengeSummaries.sort((a, b) => {
            return a.start.getTime() - b.start.getTime();
        });

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

    public static async getAllOpen(context: Context): Promise<Challenge[]> {
        const challenges = await ChallengeDao.getAllWhereEndDateGreaterThan(context.dateTime);
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

    public static async getChallengeParticipationForUser(
        userId: number
    ): Promise<GetChallengeParticipationResponse> {
        const challengeParticipation = await ChallengeParticipantDao.getAllForUser(userId);
        const models: ChallengeParticipant[] = ModelConverter.convertAll(challengeParticipation);

        return { ...SUCCESS, challengeParticipation: models };
    }

    public static async getActiveChallengeParticipationForUser(
        context: Context,
        userId: number
    ): Promise<ChallengeParticipant[]> {
        const challengeParticipation = await ChallengeParticipantDao.getAllActiveForUser(userId);
        const models: ChallengeParticipant[] = ModelConverter.convertAll(challengeParticipation);

        return models;
    }

    public static async getAllChallengeParticipationForUser(
        context: Context,
        userId: number
    ): Promise<ChallengeParticipant[]> {
        const challengeParticipation = await ChallengeParticipantDao.getAllForUser(userId);
        const models: ChallengeParticipant[] = ModelConverter.convertAll(challengeParticipation);

        return models;
    }

    public static async getCompletedChallengesForUser(
        userId: number
    ): Promise<ChallengeParticipant[]> {
        const challengeParticipation = await ChallengeParticipantDao.getAllForUser(
            userId,
            ChallengeRequirementCompletionState.COMPLETED
        );
        const models: ChallengeParticipant[] = ModelConverter.convertAll(challengeParticipation);
        return models;
    }

    public static async register(context: Context, id: number) {
        const challenge = await this.get(context, id);
        const participant = await this.getParticipantForUserAndChallenge(context.userId, id);
        if (!participant) {
            await ChallengeDao.register(context.userId, id);
            await ScheduledHabitService.createFromChallenge(context, challenge);
            await this.refreshTimelineTimestamp(challenge);
        } else if (participant.active) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'user is already registered'
            );
        } else if (participant.active === false) {
            await ChallengeDao.register(context.userId, id);
            await ScheduledHabitService.unarchiveFromChallenge(context, challenge);
        }

        ChallengeEventDispatcher.onJoined(context, id);

        return SUCCESS;
    }

    public static async updateChallengeRequirementProgress(
        context: Context,
        plannedTaskId: number
    ) {
        const plannedTask = await PlannedHabitService.getById(context, plannedTaskId);
        if (!plannedTask) {
            return [];
        }

        const userId = plannedTask.plannedDay?.userId;
        const taskId = plannedTask.scheduledHabit?.taskId;
        const date = plannedTask.plannedDay?.date;
        if (!userId || !taskId || !date) {
            return [];
        }

        const participants = await ChallengeParticipantDao.getAllForUserAndTaskAndDate(
            userId,
            taskId ?? 0,
            date
        );
        const participantModels: ChallengeParticipant[] = ModelConverter.convertAll(participants);

        for (const participant of participantModels) {
            if (!participant.challenge?.challengeRequirements) {
                continue;
            }

            const previousAmountComplete = participant.amountComplete;
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

                await ChallengeParticipantDao.update(participant);

                // dipatch events
                this.dispatchChallengeParticipationStateChange(
                    context,
                    plannedTask,
                    participant,
                    participant.amountComplete ?? 0,
                    previousAmountComplete ?? 0
                );

                if (participant.challengeRequirementCompletionState !== previousCompletionState) {
                    this.dispatchChallengeStateChange(
                        context,
                        challenge.id ?? 0,
                        participant.challengeRequirementCompletionState
                    );
                }
            }
        }
    }

    public static async getAllByTaskId(context: Context, taskId: number): Promise<Challenge[]> {
        const challenges = await ChallengeDao.getAllByTaskId(taskId);
        const challengeModels: Challenge[] = ModelConverter.convertAll(challenges);

        return challengeModels;
    }

    private static dispatchChallengeParticipationStateChange(
        context: Context,
        plannedTask: PlannedTask,
        participant: ChallengeParticipant,
        currentAmountComplete: number,
        previousAmountComplete: number
    ) {
        if (currentAmountComplete > previousAmountComplete) {
            ChallengeParticipantEventDispatcher.onProgressIncreased(
                context,
                plannedTask.plannedDayId ?? 0,
                participant.id ?? 0
            );
        }

        if (currentAmountComplete < previousAmountComplete) {
            ChallengeParticipantEventDispatcher.onProgressDecreased(
                context,
                plannedTask.plannedDayId ?? 0,
                participant.id ?? 0
            );
        }
    }

    private static dispatchChallengeStateChange(
        context: Context,
        challengeId: number,
        completionState: ChallengeRequirementCompletionState
    ) {
        if (completionState === ChallengeRequirementCompletionState.COMPLETED) {
            ChallengeEventDispatcher.onComplete(context, challengeId);
        } else {
            ChallengeEventDispatcher.onIncomplete(context, challengeId);
        }
    }

    public static async getChallengeRequirementAmountComplete(
        userId: number,
        challenge: Challenge,
        requirement: ChallengeRequirement
    ): Promise<number> {
        const start = challenge.start ?? new Date();
        const end = challenge.end ?? new Date();
        const daysInDateRange =
            Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
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

    public static async getChallengeSummariesByIds(
        context: Context,
        ids: number[]
    ): Promise<ChallengeSummary[]> {
        const challenges = await this.getAllByIds(context, ids);

        const challengeSummaries: ChallengeSummary[] = [];
        for (const challenge of challenges) {
            const challengeSummary = this.getSummaryFromChallenge(context, challenge);
            challengeSummaries.push(challengeSummary);
        }

        return challengeSummaries;
    }

    public static async create(context: Context, challenge: Challenge): Promise<Challenge> {
        const createdChallenge = await ChallengeDao.create(challenge);
        if (!createdChallenge) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'challenge create failed'
            );
        }

        const challengeModel: Challenge = ModelConverter.convert(createdChallenge);
        return challengeModel;
    }

    public static async update(context: Context, challenge: Challenge): Promise<Challenge> {
        const updatedChallenge = await ChallengeDao.update(challenge);
        if (!updatedChallenge) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'challenge update failed'
            );
        }

        const challengeModel: Challenge = ModelConverter.convert(updatedChallenge);
        return challengeModel;
    }

    public static async leave(context: Context, id: number) {
        const challenge = await this.get(context, id);

        for (const challengeRequirement of challenge.challengeRequirements ?? []) {
            const challengeTaskId = challengeRequirement.taskId;
            if (!challengeTaskId) {
                continue;
            }

            const challengeScheduledHabits = await ScheduledHabitService.getAllByTaskId(
                context,
                challengeTaskId
            );
            const challengeScheduledHabitIds = challengeScheduledHabits
                .map((habit) => habit.id ?? 0)
                .filter(Boolean);

            await ScheduledHabitService.archiveAll(context, challengeScheduledHabitIds);
        }

        const participant = await this.getParticipantForUserAndChallenge(context.userId, id);
        if (!participant) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'user is not registered'
            );
        }

        participant.active = false;
        await ChallengeParticipantDao.update(participant);

        ChallengeEventDispatcher.onLeft(context, id);
    }

    static async getParticipantForUserAndChallenge(
        userId: number,
        challengeId: number
    ): Promise<ChallengeParticipant | undefined> {
        const participant = await ChallengeParticipantDao.getForUserAndChallenge(
            userId,
            challengeId
        );
        if (!participant) {
            return undefined;
        }

        const participantModel: ChallengeParticipant = ModelConverter.convert(participant);
        return participantModel;
    }

    private static async refreshTimelineTimestamp(challenge: Challenge) {
        const now = new Date();
        const currentTimelineTimestamp = challenge.timelineTimestamp;
        if (!currentTimelineTimestamp) {
            return;
        }

        //if timelinetimestamp is 36 hours old, update it
        const timeDifference = now.getTime() - currentTimelineTimestamp.getTime();
        if (timeDifference < 1000 * 60 * 60 * 36) {
            return;
        }

        challenge.timelineTimestamp = now;
        await ChallengeDao.update(challenge);
    }

    private static getSummaryFromChallenge(
        context: Context,
        challenge: Challenge
    ): ChallengeSummary {
        const challengeSummary: ChallengeSummary = {
            id: challenge.id ?? 0,
            name: challenge.name ?? '',
            description: challenge.description ?? '',

            award: {
                id: challenge.awardId ?? 0,
                name: challenge.award?.name ?? '',
                description: challenge.award?.description ?? '',
                remoteImageUrl: challenge.award?.icon?.remoteImageUrl ?? '',
                localImage: challenge.award?.icon?.localImage ?? '',
            },
            likeCount: challenge.likes?.length ?? 0,
            participantCount: challenge.challengeParticipants?.length ?? 0,
            start: challenge.start ?? new Date(),
            end: challenge.end ?? new Date(),
            timelineTimestamp: challenge.timelineTimestamp ?? new Date(),
            isLiked: challenge.likes?.some((like) => like.userId === context.userId) ?? false,

            isParticipant:
                challenge.challengeParticipants?.some((participant) => {
                    return participant.userId === context.userId && participant.active === true;
                }) ?? false,

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
            award: {
                id: challenge.awardId ?? 0,
                name: challenge.award?.name ?? '',
                description: challenge.award?.description ?? '',
                remoteImageUrl: challenge.award?.icon?.remoteImageUrl ?? '',
                localImage: challenge.award?.icon?.localImage ?? '',
            },

            likeCount: challenge.likes?.length ?? 0,
            participantCount: challenge.challengeParticipants?.length ?? 0,
            start: challenge.start ?? new Date(),
            end: challenge.end ?? new Date(),
            timelineTimestamp: challenge.timelineTimestamp ?? new Date(),
            isLiked: challenge.likes?.some((like) => like.userId === context.userId) ?? false,

            isParticipant:
                challenge.challengeParticipants?.some((participant) => {
                    return participant.userId === context.userId && participant.active === true;
                }) ?? false,

            comments:
                challenge.comments?.map((comment) => {
                    return {
                        id: comment.id ?? 0,
                        createdAt: comment.createdAt ?? new Date(),
                        comment: comment.comment ?? '',
                        userId: comment.userId ?? 0,
                        user: {
                            id: comment.user?.id ?? 0,
                            uid: comment.user?.uid ?? '',
                            username: comment.user?.username ?? '',
                            displayName: comment.user?.displayName ?? '',
                            photoUrl: comment.user?.photoUrl ?? '',
                            roles: comment.user?.roles ?? [],
                        },
                    };
                }) ?? [],
        };

        return challengeDetails;
    }
}
