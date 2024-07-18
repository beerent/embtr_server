import { LevelDetails } from '@resources/types/dto/Level';
import { Context } from '@src/general/auth/Context';
import { UserPropertyService } from '../UserPropertyService';

export class LevelService {
    public static async setLevel(context: Context, level: number) {
        await UserPropertyService.setLevel(context, level);
    }

    public static emitLevelDetails(context: Context) {
        const levelDetails = this.getLevelDetails(context);
    }

    public static getLevelDetails(context: Context): Promise<LevelDetails> { }
}
