import { ChallengeFull } from '@resources/types/dto/Challenge';
import { ChallengeCondenser } from '@src/consense/ChallengeCondenser';
import { Context } from '@src/general/auth/Context';
import { ChallengeService } from '@src/service/ChallengeService';

export class ChallengeController {
    public static async getFull(context: Context, id: number): Promise<ChallengeFull> {
        const challengeFull = await ChallengeService.getFull(context, id);
        const condensedChallengeFull: ChallengeFull =
            ChallengeCondenser.condenseChallengeFull(challengeFull);

        return condensedChallengeFull;
    }
}
