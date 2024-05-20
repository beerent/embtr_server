import { Code } from '@resources/codes';
import { ChallengeRequirement } from '@resources/schema';
import { HttpCode } from '@src/common/RequestResponses';
import { ChallengeRequirementDao } from '@src/database/ChallengeRequirementDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class ChallengeRequirementService {
    public static async create(
        context: Context,
        challengeRequirement: ChallengeRequirement
    ): Promise<ChallengeRequirement> {
        const createdChallengeRequirement =
            await ChallengeRequirementDao.create(challengeRequirement);
        if (!challengeRequirement) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'challenge requirement create failed'
            );
        }

        const createdChallengeRequirementModel: ChallengeRequirement = ModelConverter.convert(
            createdChallengeRequirement
        );
        return createdChallengeRequirementModel;
    }
}
