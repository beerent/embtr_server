import { Award, Challenge, ChallengeRequirement, Task } from '@resources/schema';
import { Context } from '@src/general/auth/Context';
import { AwardService } from '../AwardService';
import { ChallengeMilestoneService } from '../ChallengeMilestoneService';
import { ChallengeRequirementService } from '../ChallengeRequirementService';
import { ChallengeService } from '../ChallengeService';
import { HabitService } from '../HabitService';

export class ChallengeCreationService {
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
}
