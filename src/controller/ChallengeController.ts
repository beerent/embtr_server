import { ChallengeFull } from '@resources/types/dto/Challenge';
import { ChallengeCondenser } from '@src/consense/ChallengeCondenser';
import { Context } from '@src/general/auth/Context';
import { ChallengeFullService } from '@src/service/feature/ChallengeFullService';

export class ChallengeController {
    public static async getFull(context: Context, id: number): Promise<ChallengeFull> {
        const challengeFull = await ChallengeFullService.get(context, id);
        const condensedChallengeFull: ChallengeFull =
            ChallengeCondenser.condenseChallengeFull(challengeFull);

        return condensedChallengeFull;
    }
}
