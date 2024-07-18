import { LevelDetails } from '@resources/types/dto/Level';
import { Context } from '@src/general/auth/Context';

export class LevelService {
    public static async recalculateLevel(context: Context, points: number) { }

    public static emitLevelDetails(context: Context) {
        const levelDetails = this.getLevelDetails(context);
    }

    public static getLevelDetails(context: Context): Promise<LevelDetails> { }
}
