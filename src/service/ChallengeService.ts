import { Code } from '@resources/codes';
import {
    Challenge,
    ChallengeCalculationType,
    ChallengeParticipant,
    ChallengeRequirement,
    ChallengeRequirementCompletionState,
    JoinedChallenge,
    PlannedTask,
} from '@resources/schema';
import {
    GetChallengeParticipationResponse,
    GetChallengesResponse,
    GetJoinedChallengesResponse,
} from '@resources/types/requests/ChallengeTypes';
import { GENERAL_FAILURE, HttpCode, SUCCESS } from '@src/common/RequestResponses';
import { ChallengeDao, ChallengeRequirementResults } from '@src/database/ChallengeDao';
import { ChallengeParticipantDao } from '@src/database/ChallengeParticipantDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';
import { ScheduledHabitService } from './ScheduledHabitService';

export class ChallengeService {
    public static async getAll(): Promise<GetChallengesResponse> {
        const challenges = await ChallengeDao.getAll();
        const challengeModels: Challenge[] = ModelConverter.convertAll(challenges);

        return { ...SUCCESS, challenges: challengeModels };
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

    public static async getRecentJoins(request: Request): Promise<GetJoinedChallengesResponse> {
        let upperBound = new Date();
        if (request.query.upperBound) {
            upperBound = new Date(request.query.upperBound as string);
        }

        let lowerBound = new Date(new Date().setMonth(new Date().getMonth() - 300));
        if (request.query.lowerBound) {
            lowerBound = new Date(request.query.lowerBound as string);
        }

        const challenges = await ChallengeDao.getAllRecentJoins(upperBound, lowerBound);
        const models: Challenge[] = ModelConverter.convertAll(challenges);

        const joinedChallenges: JoinedChallenge[] = [];
        for (const challenge of models) {
            const participants: ChallengeParticipant[] = [];
            for (const participant of challenge.challengeParticipants ?? []) {
                if (!participant.createdAt) {
                    continue;
                }
                if (
                    participant.createdAt.getTime() >= lowerBound.getTime() &&
                    participant.createdAt.getTime() <= upperBound.getTime()
                ) {
                    participants.push(participant as ChallengeParticipant);
                }
            }

            const joinedChallenge: JoinedChallenge = {
                challenge,
                participants,
            };

            joinedChallenges.push(joinedChallenge);
        }

        return { ...SUCCESS, joinedChallenges };
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
        const challengeParticipation = await ChallengeParticipantDao.getAllActiveForUser(
            userId
        );
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
        if (challenge?.challengeParticipants?.some((participant) => participant.userId === context.userId)) {
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
            await ChallengeDao.getChallengeRequirementProgess(
                start,
                end,
                userId,
                interval,
                taskId
            );

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
}
