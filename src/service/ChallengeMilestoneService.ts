import { Context } from '@src/general/auth/Context';
import { ChallengeMilestoneConsistencyService } from './feature/ChallengeMilestoneConsistencyeService';

export class ChallengeMilestoneService {
    public static async setMilestones(
        context: Context,
        plannedDayId: number,
        challengeParticipantId: number
    ) {
        await ChallengeMilestoneConsistencyService.consistChallengeMilestones(
            context,
            plannedDayId,
            challengeParticipantId
        );
    }
}
