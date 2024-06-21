import { Constants } from '@resources/types/constants/constants';
import { Context } from '@src/general/auth/Context';
import { HabitStreak } from '@resources/schema';
import { HabitStreakDao } from '@src/database/HabitStreakDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class HabitStreakService {
    public static async update(
        context: Context,
        userId: number,
        type: Constants.HabitStreakType,
        streak: number,
        habitId?: number
    ) {
        const habitStreak: HabitStreak = {
            userId,
            type,
            streak,
            taskId: habitId,
        };

        const upsertedHabitStreak = await HabitStreakDao.upsert(habitStreak);
        const upsertedHabitStreakModel = ModelConverter.convert(upsertedHabitStreak);

        return upsertedHabitStreakModel;
    }

    public static async getLongestHabitStreak(
        context: Context,
        userId: number,
        habitId?: number
    ): Promise<HabitStreak | undefined> {
        const habitStreak = await this.get(
            context,
            userId,
            Constants.HabitStreakType.LONGEST,
            habitId
        );
        if (!habitStreak) {
            return undefined;
        }

        return habitStreak;
    }

    public static async getCurrentHabitStreak(
        context: Context,
        userId: number,
        habitId?: number
    ): Promise<HabitStreak | undefined> {
        const habitStreak = await this.get(
            context,
            userId,
            Constants.HabitStreakType.CURRENT,
            habitId
        );
        if (!habitStreak) {
            return undefined;
        }

        return habitStreak;
    }

    public static async get(
        context: Context,
        userId: number,
        type: string,
        habitId?: number
    ): Promise<HabitStreak | undefined> {
        const habitStreak = await HabitStreakDao.getByDetails(userId, type, habitId);
        if (!habitStreak) {
            return undefined;
        }

        const habitStreakModel: HabitStreak = ModelConverter.convert(habitStreak);
        return habitStreakModel;
    }
}
