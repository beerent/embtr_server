import { PlannedDayChallengeMilestoneDao } from '@src/database/PlannedDayChallengeMilestoneDao';
import { Context } from '@src/general/auth/Context';

export class PlannedDayChallengeMilestoneService {
    public static async deleteAll(context: Context, ids: number[]) {
        return PlannedDayChallengeMilestoneDao.deleteAll(ids);
    }

    public static async getAllForChallengeParticipantAndChallengeMilestoneInList(
        context: Context,
        challengeParticipantId: number,
        challengeMilestoneIds: number[]
    ) {
        const results =
            await PlannedDayChallengeMilestoneDao.getAllForChallengeParticipantWithChallengeMilestoneInList(
                challengeParticipantId,
                challengeMilestoneIds
            );

        return results;
    }

    public static async deleteAllForChallengeParticipantAndChallengeMilestoneInList(
        context: Context,
        challengeParticipantId: number,
        challengeMilestoneIds: number[]
    ) {
        return PlannedDayChallengeMilestoneDao.deleteAllForChallengeParticipantWithChallengeMilestoneInList(
            challengeParticipantId,
            challengeMilestoneIds
        );
    }

    public static async create(
        context: Context,
        plannedDayId: number,
        challengeMilestoneId: number,
        challengeParticipantId: number
    ) {
        console.log(
            'creating planned day challenge milestone',
            plannedDayId,
            challengeMilestoneId,
            challengeParticipantId
        );
        return PlannedDayChallengeMilestoneDao.create(
            plannedDayId,
            challengeMilestoneId,
            challengeParticipantId
        );
    }
}
