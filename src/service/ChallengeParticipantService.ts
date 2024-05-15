import { ChallengeParticipant } from '@resources/schema';
import { ChallengeParticipantDao } from '@src/database/ChallengeParticipantDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class ChallengeParticipantService {
    public static async get(
        context: Context,
        id: number
    ): Promise<ChallengeParticipant | undefined> {
        const challengeParticipant = await ChallengeParticipantDao.getById(id);
        if (!challengeParticipant) {
            return undefined;
        }

        const challengeParticipantModel: ChallengeParticipant =
            ModelConverter.convert(challengeParticipant);
        return challengeParticipantModel;
    }
}
