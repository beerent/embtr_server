import { PlannedTask } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { logger } from '@src/common/logger/Logger';
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

        let usersNotifiedCount = 0;
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

            const isDailyReminderLocalTime = this.isDailyReminderLocalTime(timezone.value);
            if (!isDailyReminderLocalTime) {
                continue;
            }

            const dayKey = DayKeyUtility.getDayKeyFromTimezone(timezone.value);
            const plannedDay = await PlannedDayService.getByUser(context, user.id, dayKey);
            const plannedTasks = plannedDay.plannedTasks;
            if (!plannedTasks) {
                continue;
            }

            const incompleteCount = this.getIncompleteCount(plannedTasks);
            if (incompleteCount === 0) {
                continue;
            }

            usersNotifiedCount++;

            const habit = incompleteCount === 1 ? 'habit' : 'habits';
            const message = `You have ${incompleteCount} ${habit} to complete today!`;

            PushNotificationService.sendGenericNotification(context, user, message);
        }

        logger.info(`Sent daily reminders to ${usersNotifiedCount} users.`);
    }

    public static async sendPeriodicReminders(context: Context): Promise<void> {
        const users = await UserService.getUsersWithProperty(
            context,
            Constants.UserPropertyKey.REMINDER_NOTIFICATIONS_SETTING,
            Constants.ReminderNotificationSetting.PERIODICALLY
        );

        let usersNotifiedCount = 0;
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
            if (incompleteCount === 0) {
                continue;
            }

            usersNotifiedCount++;

            const periodPretty = TimeOfDayUtility.getPeriodPretty(period);
            const habit = incompleteCount === 1 ? 'habit' : 'habits';
            const message = `You have ${incompleteCount} ${habit} to complete this ${periodPretty}!`;

            PushNotificationService.sendGenericNotification(context, user, message);
        }

        logger.info(`Sent periodic reminders to ${usersNotifiedCount} users.`);
    }

    public static async sendDailyWarnings(context: Context) {
        const users = await UserService.getUsersWithProperty(
            context,
            Constants.UserPropertyKey.WARNING_NOTIFICATIONS_SETTING,
            Constants.WarningNotificationSetting.DAILY
        );

        let usersNotifiedCount = 0;
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

            const isDailyWarningLocalTime = this.isDailyWarningLocalTime(timezone.value);
            if (!isDailyWarningLocalTime) {
                continue;
            }

            const dayKey = DayKeyUtility.getDayKeyFromTimezone(timezone.value);
            const plannedDay = await PlannedDayService.getByUser(context, user.id, dayKey);
            const plannedTasks = plannedDay.plannedTasks;
            if (!plannedTasks) {
                continue;
            }

            const incompleteCount = this.getIncompleteCount(plannedTasks);
            if (incompleteCount === 0) {
                continue;
            }

            usersNotifiedCount++;

            const habit = incompleteCount === 1 ? 'habit' : 'habits';
            const message = `Heads up! You have ${incompleteCount} ${habit} remaining today.`;

            PushNotificationService.sendGenericNotification(context, user, message);
        }

        logger.info(`Sent daily warnings to ${usersNotifiedCount} users.`);
    }

    public static async sendPeriodicWarnings(context: Context): Promise<void> {
        const users = await UserService.getUsersWithProperty(
            context,
            Constants.UserPropertyKey.WARNING_NOTIFICATIONS_SETTING,
            Constants.WarningNotificationSetting.PERIODICALLY
        );

        let usersNotifiedCount = 0;
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

            const period = this.getUserWarningPeriod(timezone.value);
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
            if (incompleteCount === 0) {
                continue;
            }

            usersNotifiedCount++;

            const periodPretty = TimeOfDayUtility.getPeriodPretty(period);
            const habit = incompleteCount === 1 ? 'habit' : 'habits';
            const message = `Heads up! You have ${incompleteCount} ${habit} remaining this ${periodPretty}.`;

            PushNotificationService.sendGenericNotification(context, user, message);
        }

        logger.info(`Sent periodic warnings to ${usersNotifiedCount} users.`);
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
}
