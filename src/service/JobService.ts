import { Context } from '@src/general/auth/Context';
import { AwayModeService } from './feature/AwayModeService';
import { ReminderService } from './feature/ReminderService';
import { RetentionService } from './feature/RetentionService';
import { UserService } from './UserService';

export class JobService {
    public static async sendDailyReminders(context: Context): Promise<void> {
        await ReminderService.sendDailyReminders(context);
    }

    public static async sendPeriodicReminders(context: Context): Promise<void> {
        await ReminderService.sendPeriodicReminders(context);
    }

    public static async sendDailyWarnings(context: Context): Promise<void> {
        await ReminderService.sendDailyWarnings(context);
    }

    public static async sendPeriodicWarnings(context: Context): Promise<void> {
        await ReminderService.sendPeriodicWarnings(context);
    }

    public static async refreshPremiumUsers(context: Context): Promise<void> {
        await UserService.refreshPremiumUsers(context);
    }

    public static async refreshNewUsers(context: Context): Promise<void> {
        await UserService.refreshNewUsers(context);
    }

    public static async refreshAwayMode(context: Context): Promise<void> {
        await AwayModeService.refreshAll(context);
    }

    public static async sendRetentionNotificationToUsersWithNoScheduledHabits(
        context: Context
    ): Promise<void> {
        await RetentionService.notifyUsersWithNoScheduledHabits(context);
    }

    public static async sendRetentionNotificationToUsersWithAllExpiredScheduledHabits(
        context: Context
    ): Promise<void> {
        await RetentionService.notifyUsersWithAllExpiredScheduledHabits(context);
    }

    public static async sendRetentionNotificationToInactiveUsersWithScheduledHabits(
        context: Context
    ): Promise<void> {
        await RetentionService.notifyInactiveUsersWithScheduledHabits(context);
    }
}
