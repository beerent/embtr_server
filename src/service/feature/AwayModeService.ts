import { Constants } from '@resources/types/constants/constants';
import { logger } from '@src/common/logger/Logger';
import { Context, ContextType } from '@src/general/auth/Context';
import { DayKeyUtility } from '@src/utility/date/DayKeyUtility';
import { PlannedDayService } from '../PlannedDayService';
import { UserPropertyService } from '../UserPropertyService';
import { UserService } from '../UserService';

export class AwayModeService {
    public static async refreshAll(context: Context) {
        const users = await UserService.getUsersWithProperty(
            context,
            Constants.UserPropertyKey.AWAY_MODE,
            Constants.AwayMode.ENABLED
        );

        for (const user of users) {
            if (!user.id) {
                continue;
            }

            await this.refresh(context, user.id);
        }
    }

    public static async update(context: Context, awayMode: Constants.AwayMode) {
        await UserPropertyService.setAwayMode(context, awayMode);

        if (awayMode === Constants.AwayMode.ENABLED) {
            await this.refresh(context, context.userId);
        } else {
            await this.remove(context, context.userId);
        }
    }

    public static async get(context: Context): Promise<Constants.AwayMode> {
        return await UserPropertyService.getAwayMode(context);
    }

    private static async refresh(context: Context, userId: number) {
        const timezone = await UserPropertyService.getTimezone(context, userId);

        const dayKey = DayKeyUtility.getDayKeyFromTimezone(timezone);
        const plannedDay = await PlannedDayService.getOrCreate(context, userId, dayKey);
        if (!plannedDay) {
            return;
        }

        if (context.type === ContextType.JOB_CONTEXT) {
            logger.info('Setting away mode for user:', userId + ' on day:', dayKey);
        }

        plannedDay.status = Constants.CompletionState.AWAY;
        await PlannedDayService.update(context, plannedDay);
    }

    private static async remove(context: Context, userId: number) {
        const timezone = await UserPropertyService.getTimezone(context, userId);

        const dayKey = DayKeyUtility.getDayKeyFromTimezone(timezone);
        const plannedDay = await PlannedDayService.getOrCreate(context, userId, dayKey);
        if (!plannedDay) {
            return;
        }

        const completionStatus = await PlannedDayService.getCompletionStatus(
            context,
            userId,
            dayKey
        );
        plannedDay.status = completionStatus;
        await PlannedDayService.update(context, plannedDay);
    }
}
