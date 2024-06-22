import { HabitStreakTier } from '@resources/schema';
import { HabitStreakTierDao } from '@src/database/HabitStreakTierDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { HabitStreakService } from './HabitStreakService';
import { DetailedHabitStreakService } from '@src/service/DetailedHabitStreakService';
import { UserHabitStreakTier } from '@resources/types/dto/HabitStreak';
import { ServiceException } from '@src/general/exception/ServiceException';
import { HttpCode } from '@src/common/RequestResponses';
import { Code } from '@resources/codes';

export class HabitStreakTierService {
    public static async getForUser(context: Context, userId: number) {
        const [habitStreak, habitStreakTier] = await Promise.all([
            DetailedHabitStreakService.getSimple(context, userId),
            this.getHabitStreakTier(context, userId),
        ]);

        if (!habitStreak || !habitStreakTier) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'Failed to get habit streak tier'
            );
        }

        const userHabitStreakTier: UserHabitStreakTier = {
            simpleHabitStreak: habitStreak,
            habitStreakTier: habitStreakTier,
        };

        return userHabitStreakTier;
    }

    public static async getAllWithBadge(context: Context) {
        const habitStreakTiers = await HabitStreakTierDao.getAllWithBadge();
        const habitStreakTierModels: HabitStreakTier[] =
            ModelConverter.convertAll(habitStreakTiers);

        return habitStreakTierModels;
    }

    public static async getAll(context: Context) {
        const habitStreakTiers = await HabitStreakTierDao.getAll();
        const habitStreakTierModels: HabitStreakTier[] =
            ModelConverter.convertAll(habitStreakTiers);

        return habitStreakTierModels;
    }

    private static async getHabitStreakTier(context: Context, userId: number) {
        const habitStreakTiers = await HabitStreakTierService.getAll(context);
        const currentHabitStreak = await HabitStreakService.getCurrentHabitStreak(context, userId);

        for (const habitStreakTier of habitStreakTiers) {
            const min = habitStreakTier.minStreak ?? -1;
            const max = habitStreakTier.maxStreak ?? -1;
            const streak = currentHabitStreak?.streak ?? -1;

            if (streak >= min && streak <= max) {
                return habitStreakTier;
            }
        }

        return undefined;
    }

    public static async create(context: Context, habitStreakTier: HabitStreakTier) {
        const createdHabitStreakTier = await HabitStreakTierDao.create(habitStreakTier);
        const habitStreakTierModel: HabitStreakTier =
            ModelConverter.convert(createdHabitStreakTier);

        return habitStreakTierModel;
    }

    public static async update(context: Context, tierId: number, habitStreakTier: HabitStreakTier) {
        const createHabitStreakTier = await HabitStreakTierDao.update(tierId, habitStreakTier);
        const habitStreakTierModel: HabitStreakTier = ModelConverter.convert(createHabitStreakTier);

        return habitStreakTierModel;
    }
}
