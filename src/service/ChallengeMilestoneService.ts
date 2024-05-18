import { Context } from '@src/general/auth/Context';
import { ChallengeMilestoneConsistencyService } from './feature/ChallengeMilestoneConsistencyeService';

export class ChallengeMilestoneService {
    public static async recalculateMilestonesOnIncrease(
        context: Context,
        plannedDayId: number,
        challengeParticipantId: number
    ) {
        await ChallengeMilestoneConsistencyService.recalculateMilestonesOnIncrease(
            context,
            plannedDayId,
            challengeParticipantId
        );
    }

    public static async recalulateMilestonesOnDecrease(
        context: Context,
        plannedDayId: number,
        challengeParticipantId: number
    ) {
        await ChallengeMilestoneConsistencyService.recalculateMilestonesOnDecrease(
            context,
            plannedDayId,
            challengeParticipantId
        );
    }
}
