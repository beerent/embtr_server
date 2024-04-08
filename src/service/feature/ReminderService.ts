import { logger } from '@src/common/logger/Logger';
import { PlannedTask, User } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { Context } from '@src/general/auth/Context';
import { DayKeyUtility } from '@src/utility/date/DayKeyUtility';
import { TimeOfDayUtility } from '@src/utility/TimeOfDayUtility';
import { UserPropertyUtility } from '@src/utility/UserPropertyUtility';
import { PlannedDayService } from '../PlannedDayService';
import { PushNotificationService } from '../PushNotificationService';
import { UserService } from '../UserService';

export class ReminderService {
    public static async sendDailyReminders(context: Context): Promise<void> {
        const users = await UserService.getUsersWithProperty(
            context,
            Constants.UserPropertyKey.REMINDER_NOTIFICATIONS_SETTING,
            Constants.ReminderNotificationSetting.DAILY
        );

        for (const user of users) {
            try {
                await this.sendUserDailyReminder(context, user);
            } catch (e) {
                logger.error("failed to send user daily reminder", e);
            }
        }
    }

    public static async sendPeriodicReminders(context: Context): Promise<void> {
        const users = await UserService.getUsersWithProperty(
            context,
            Constants.UserPropertyKey.REMINDER_NOTIFICATIONS_SETTING,
            Constants.ReminderNotificationSetting.PERIODICALLY
        );

        for (const user of users) {
            try {
                this.sendUserPeriodicReminder(context, user);
            } catch (e) {
                logger.error("failed to send user periodic reminder", e);
            }
        }
    }

    public static async sendDailyWarnings(context: Context) {
        const users = await UserService.getUsersWithProperty(
            context,
            Constants.UserPropertyKey.WARNING_NOTIFICATIONS_SETTING,
            Constants.WarningNotificationSetting.DAILY
        );

        for (const user of users) {
            try {
                this.sendUserDailyWarning(context, user);
            } catch (e) {
                logger.error("failed to send user daily warning", e);
            }
        }
    }

    public static async sendPeriodicWarnings(context: Context): Promise<void> {
        const users = await UserService.getUsersWithProperty(
            context,
            Constants.UserPropertyKey.WARNING_NOTIFICATIONS_SETTING,
            Constants.WarningNotificationSetting.PERIODICALLY
        );

        for (const user of users) {
            try {
                this.sendUserPeriodicWarning(context, user);
            } catch (e) {
                logger.error("failed to send periodic warning", e);
            }
        }
    }

    private static isDailyReminderLocalTime(timezone: string) {
        const currentTime = new Date();
        const usersHour = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: timezone,
        }).format(currentTime);

        return usersHour === '11';
    }

    private static isDailyWarningLocalTime(timezone: string) {
        const currentTime = new Date();
        const usersHour = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: timezone,
        }).format(currentTime);

        return usersHour === '16';
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

    private static getUserWarningPeriod(timezone: string) {
        const currentTime = new Date();
        const usersHour = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: timezone,
        }).format(currentTime);

        if (usersHour === '11') {
            return Constants.Period.MORNING;
        }

        if (usersHour === '15') {
            return Constants.Period.AFTERNOON;
        }

        if (usersHour === '19') {
            return Constants.Period.EVENING;
        }

        if (usersHour === '21') {
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

    private static async sendUserDailyReminder(context: Context, user: User): Promise<void> {
        if (!user.id) {
            return;
        }

        const timezone = UserPropertyUtility.getProperty(
            user,
            Constants.UserPropertyKey.TIMEZONE
        );
        if (!timezone?.value) {
            return;
        }

        const isDailyReminderLocalTime = this.isDailyReminderLocalTime(timezone.value);
        if (!isDailyReminderLocalTime) {
            return;
        }

        const dayKey = DayKeyUtility.getDayKeyFromTimezone(timezone.value);
        const plannedDay = await PlannedDayService.getByUser(context, user.id, dayKey);
        const plannedTasks = plannedDay.plannedTasks;
        if (!plannedTasks) {
            return;
        }

        const incompleteCount = this.getIncompleteCount(plannedTasks);
        if (incompleteCount === 0) {
            return;
        }

        const habit = incompleteCount === 1 ? 'habit' : 'habits';
        const message = `You have ${incompleteCount} ${habit} to complete today!`;

        PushNotificationService.sendGenericNotification(context, user, message);
    }

    private static async sendUserPeriodicReminder(context: Context, user: User) {
        if (!user.id) {
            return;
        }

        const timezone = UserPropertyUtility.getProperty(
            user,
            Constants.UserPropertyKey.TIMEZONE
        );
        if (!timezone?.value) {
            return;
        }

        const period = this.getUserPeriod(timezone.value);
        if (!period) {
            return;
        }

        const dayKey = DayKeyUtility.getDayKeyFromTimezone(timezone.value);
        const plannedDay = await PlannedDayService.getByUser(context, user.id, dayKey);
        if (!plannedDay?.plannedTasks) {
            return;
        }

        const plannedTasks = plannedDay.plannedTasks.filter(
            (task) => task.timeOfDay?.period === period
        );

        if (plannedTasks.length === 0) {
            return;
        }

        const incompleteCount = this.getIncompleteCount(plannedTasks);
        if (incompleteCount === 0) {
            return;
        }

        const periodPretty = TimeOfDayUtility.getPeriodPretty(period);
        const habit = incompleteCount === 1 ? 'habit' : 'habits';
        const message = `You have ${incompleteCount} ${habit} to complete this ${periodPretty}!`;

        PushNotificationService.sendGenericNotification(context, user, message);
    }

    private static async sendUserDailyWarning(context: Context, user: User) {
        if (!user.id) {
            return;
        }

        const timezone = UserPropertyUtility.getProperty(
            user,
            Constants.UserPropertyKey.TIMEZONE
        );
        if (!timezone?.value) {
            return;
        }

        const isDailyWarningLocalTime = this.isDailyWarningLocalTime(timezone.value);
        if (!isDailyWarningLocalTime) {
            return;
        }

        const dayKey = DayKeyUtility.getDayKeyFromTimezone(timezone.value);
        const plannedDay = await PlannedDayService.getByUser(context, user.id, dayKey);
        const plannedTasks = plannedDay.plannedTasks;
        if (!plannedTasks) {
            return;
        }

        const incompleteCount = this.getIncompleteCount(plannedTasks);
        if (incompleteCount === 0) {
            return;
        }

        const habit = incompleteCount === 1 ? 'habit' : 'habits';
        const message = `Heads up! You have ${incompleteCount} ${habit} remaining today.`;

        PushNotificationService.sendGenericNotification(context, user, message);
    }

    private static async sendUserPeriodicWarning(context: Context, user: User) {
        if (!user.id) {
            return;
        }

        const timezone = UserPropertyUtility.getProperty(
            user,
            Constants.UserPropertyKey.TIMEZONE
        );
        if (!timezone?.value) {
            return;
        }

        const period = this.getUserWarningPeriod(timezone.value);
        if (!period) {
            return;
        }

        const dayKey = DayKeyUtility.getDayKeyFromTimezone(timezone.value);
        const plannedDay = await PlannedDayService.getByUser(context, user.id, dayKey);
        if (!plannedDay?.plannedTasks) {
            return;
        }

        const plannedTasks = plannedDay.plannedTasks.filter(
            (task) => task.timeOfDay?.period === period
        );

        if (plannedTasks.length === 0) {
            return;
        }

        const incompleteCount = this.getIncompleteCount(plannedTasks);
        if (incompleteCount === 0) {
            return;
        }

        const periodPretty = TimeOfDayUtility.getPeriodPretty(period);
        const habit = incompleteCount === 1 ? 'habit' : 'habits';
        const message = `Heads up! You have ${incompleteCount} ${habit} remaining this ${periodPretty}.`;

        PushNotificationService.sendGenericNotification(context, user, message);
    }
}
