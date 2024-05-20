import { Code } from '@resources/codes';
import { ChallengeMilestone } from '@resources/schema';
import { HttpCode } from '@src/common/RequestResponses';
import { ChallengeMilestoneDao } from '@src/database/ChallengeMilestoneDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
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

    public static async createAll(context: Context, challengeId: number, milestoneKeys: string[]) {
        const challengeMilestones = [];
        for (const milestoneKey of milestoneKeys) {
            const challengeMilestone = this.create(context, challengeId, milestoneKey);
            challengeMilestones.push(challengeMilestone);
        }

        return challengeMilestones;
    }

    public static async create(context: Context, challengeId: number, milestoneKey: string) {
        const challengeMilestone = await ChallengeMilestoneDao.create(challengeId, milestoneKey);
        if (!challengeMilestone) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'challenge milestone create failed'
            );
        }

        const challengeMilestoneModel: ChallengeMilestone =
            ModelConverter.convert(challengeMilestone);
        return challengeMilestoneModel;
    }
}
