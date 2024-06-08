import { Award, Challenge, ChallengeRequirement, Task } from '@resources/schema';
import { Context } from '@src/general/auth/Context';
import { AwardService } from '../AwardService';
import { ChallengeMilestoneService } from '../ChallengeMilestoneService';
import { ChallengeRequirementService } from '../ChallengeRequirementService';
import { ChallengeService } from '../ChallengeService';
import { HabitService } from '../HabitService';
import { Code } from '@resources/codes';
import { ServiceException } from '@src/general/exception/ServiceException';
import { PlannedDayChallengeMilestoneService } from '../PlannedDayChallengeMilestoneService';
import { ChallengeFull } from '@resources/types/dto/Challenge';
import { HttpCode } from '@src/common/RequestResponses';

export class ChallengeFullService {
    public static async create(
        context: Context,
        challenge: Challenge,
        award: Award,
        task: Task,
        challengeRequirement: ChallengeRequirement,
        milestoneKeys: string[]
    ): Promise<Challenge> {
        //create award
        const createdAward = await AwardService.create(context, award);
        console.log('createdAward', createdAward.id);

        // create task
        task.type = 'CHALLENGE';
        task.userId = context.userId;
        const createdHabit = await HabitService.create(context, task);
        console.log('createdHabit', createdHabit.id);

        //create challenge
        challenge.awardId = createdAward.id;
        challenge.creatorId = context.userId;
        const createdChallenge = await ChallengeService.create(context, challenge);
        console.log('createdChallenge', createdChallenge.id);

        // create challenge requirement
        challengeRequirement.taskId = createdHabit.id;
        challengeRequirement.challengeId = createdChallenge.id;
        const createdChallengeRequirement = await ChallengeRequirementService.create(
            context,
            challengeRequirement
        );
        console.log('createdChallengeRequirement', createdChallengeRequirement.id);

        // create challenge milestones
        if (createdChallenge.id && milestoneKeys.length > 0) {
            const createdMilestones = await ChallengeMilestoneService.createAll(
                context,
                createdChallenge.id,
                milestoneKeys
            );
        }

        // get challenge model
        const challengeModel = await ChallengeService.get(context, createdChallenge.id ?? 0);
        return challengeModel;
    }

    public static async update(
        context: Context,
        id: number,
        challengeFull: ChallengeFull
    ): Promise<Challenge> {
        const existingChallenge = await ChallengeService.get(context, id);
        if (!existingChallenge) {
            throw new ServiceException(400, Code.USER_CREATE_FAILED, 'edit challenge failed');
        }

        const challenge: Challenge = { ...challengeFull.challenge };
        challenge.id = id;

        const award: Award = { ...challengeFull.award };
        const task: Task = { ...challengeFull.task };
        const challengeRequirement: ChallengeRequirement = {
            ...challengeFull.challengeRequirement,
        };
        const milestoneKeys: string[] = [...challengeFull.milestoneKeys];

        //update award
        const updatedAward = await AwardService.update(context, award);

        // update task
        task.type = 'CHALLENGE';
        task.userId = context.userId;
        const updatedHabit = await HabitService.update(context, task);

        //update challenge
        challenge.awardId = updatedAward.id;
        challenge.creatorId = context.userId;
        const updatedChallenge = await ChallengeService.update(context, challenge);

        // update challenge requirement
        challengeRequirement.taskId = updatedHabit.id;
        challengeRequirement.challengeId = updatedChallenge.id;
        const updatedChallengeRequirement = await ChallengeRequirementService.update(
            context,
            challengeRequirement
        );

        // remove any currently earned milestones
        await PlannedDayChallengeMilestoneService.deleteAllByChallenge(
            context,
            updatedChallenge.id ?? -1
        );

        //remove any milestones in general
        await ChallengeMilestoneService.removeAllForChallenge(context, challenge.id ?? -1);

        //create challenge milestones
        if (updatedChallenge.id && milestoneKeys.length > 0) {
            const createdMilestones = await ChallengeMilestoneService.createAll(
                context,
                updatedChallenge.id,
                milestoneKeys
            );
        }

        // get challenge model
        const challengeModel = await ChallengeService.get(context, updatedChallenge.id ?? 0);
        return challengeModel;
    }

    public static async get(context: Context, id: number): Promise<ChallengeFull> {
        const challenge = await ChallengeService.get(context, id);
        if (!challenge.awardId || (challenge.challengeRequirements?.length ?? 0) < 1) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'challenge is not full'
            );
        }

        const award = await AwardService.get(context, challenge.awardId ?? 0);
        const challengeRequirement = challenge.challengeRequirements![0];
        const task = await HabitService.get(context, challengeRequirement.taskId ?? 0);
        const challengeMilestones = challenge.challengeMilestones ?? [];
        const challengeMilestoneKeys = challengeMilestones.flatMap((challengeMilestone) => {
            return challengeMilestone.milestone?.key ? [challengeMilestone.milestone.key] : [];
        });

        const challengeFull: ChallengeFull = {
            challenge: { ...challenge },
            award: { ...award },
            challengeRequirement: { ...challengeRequirement },
            task: { ...task },
            milestoneKeys: challengeMilestoneKeys,
        };

        return challengeFull;
    }
}
