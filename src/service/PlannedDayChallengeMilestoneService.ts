import { PlannedDayChallengeMilestone } from '@resources/schema';
import { PlannedDayChallengeMilestoneDao } from '@src/database/PlannedDayChallengeMilestoneDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PlannedDayChallengeMilestoneService {
    public static async deleteAll(context: Context, ids: number[]) {
        return PlannedDayChallengeMilestoneDao.deleteAll(ids);
    }

    public static async getAllForChallengeParticipantAndChallengeMilestoneInList(
        context: Context,
        challengeParticipantId: number,
        challengeMilestoneIds: number[]
    ): Promise<PlannedDayChallengeMilestone[]> {
        const plannedDayChallengeMilestones =
            await PlannedDayChallengeMilestoneDao.getAllForChallengeParticipantWithChallengeMilestoneInList(
                challengeParticipantId,
                challengeMilestoneIds
            );

        const plannedDayChallengeMilestoneModels: PlannedDayChallengeMilestone[] =
            ModelConverter.convertAll(plannedDayChallengeMilestones);
        return plannedDayChallengeMilestoneModels;
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

    public static async deleteAllByChallenge(context: Context, challengeId: number) {
        return PlannedDayChallengeMilestoneDao.deleteAllByChallenge(challengeId);
    }

    public static async create(
        context: Context,
        plannedDayId: number,
        challengeMilestoneId: number,
        challengeParticipantId: number
    ): Promise<PlannedDayChallengeMilestone> {
        const plannedDayChallengeMilestone = await PlannedDayChallengeMilestoneDao.create(
            plannedDayId,
            challengeMilestoneId,
            challengeParticipantId
        );

        const plannedDayChallengeMilestoneModel: PlannedDayChallengeMilestone =
            ModelConverter.convert(plannedDayChallengeMilestone);
        return plannedDayChallengeMilestoneModel;
    }
}
