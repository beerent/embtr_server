import { PlannedTask } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { PushNotificationDao } from '@src/database/PushNotificationDao';
import { Context } from '@src/general/auth/Context';
import { DayKeyUtility } from '@src/utility/date/DayKeyUtility';
import { UserPropertyUtility } from '@src/utility/UserPropertyUtility';
import { PlannedDayService } from '../PlannedDayService';
import { UserService } from '../UserService';

export class ReminderService {
    public static async sendPeriodicReminders(context: Context): Promise<void> {
        const users = await UserService.getUsersWithProperty(
            context,
            Constants.UserPropertyKey.REMINDER_NOTIFICATIONS_SETTING,
            Constants.ReminderNotificationSetting.PERIODICALLY
        );

        for (const user of users) {
            if (!user.id) {
                continue;
            }

            const timezone = UserPropertyUtility.getProperty(
                user,
                Constants.UserPropertyKey.TIMEZONE
            );
            if (!timezone?.value) {
                continue;
            }

            const period = this.getUserPeriod(timezone.value);
            if (!period) {
                continue;
            }

            const dayKey = DayKeyUtility.getDayKeyFromTimezone(timezone.value);
            const plannedDay = await PlannedDayService.getByUser(context, user.id, dayKey);
            if (!plannedDay?.plannedTasks) {
                continue;
            }

            const plannedTasks = plannedDay.plannedTasks.filter(
                (task) => task.timeOfDay?.period === period
            );

            if (plannedTasks.length === 0) {
                continue;
            }

            const incompleteCount = this.getIncompleteCount(plannedTasks);
            const message = `You have ${incompleteCount} habits remaining for this ${period}!`;
            PushNotificationDao.sendGenericNotification(user, message);
        }
    }

    private static getUserPeriod(timezone: string) {
        const currentTime = new Date();
        const usersHour = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: timezone,
        }).format(currentTime);

        if (usersHour === '08') {
            return Constants.Period.MORNING;
        }

        if (usersHour === '12') {
            return Constants.Period.AFTERNOON;
        }

        if (usersHour === '16') {
            return Constants.Period.EVENING;
        }

        if (usersHour === '20') {
            return Constants.Period.NIGHT;
        }

        return undefined;
    }

    private static getIncompleteCount(plannedTasks: PlannedTask[]) {
        const totalHabitCount = plannedTasks.length;
        const finshedHabitCount = plannedTasks.filter((task) => {
            if (
                task.status === Constants.CompletionState.FAILED ||
                task.status === Constants.CompletionState.SKIPPED
            ) {
                return true;
            }

            const completed = task.completedQuantity || 0;
            const quantity = task.quantity || 1;

            return completed >= quantity;
        }).length;
        const unfinishedHabitCount = totalHabitCount - finshedHabitCount;

        return unfinishedHabitCount;
    }
}
