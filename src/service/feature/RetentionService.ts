import { User } from '@resources/schema';
import { Context } from '@src/general/auth/Context';
import { UserTimezoneUtility } from '@src/utility/UserTimezoneUtility';
import { PushNotificationService } from '../PushNotificationService';
import { UserService } from '../UserService';

const NOTIFICATION_HOUR = 10;

const NO_SCHEDULED_HABIT_INSPIRATIONAL_NOTIFICATIONS = [
    "It's time to achieve the life you've dreamed of, start your habit journey today!",
    'One day, or day one? You decide. Create your first habit and start your journey today!',
    'The best time to plant a tree was 20 years ago. Same applies with habits. Create your first habit now!',
    'The secret of getting ahead is getting started. Create your first habit and start your journey today!',
    'The best way to predict the future is to create it. Create your first habit and start your journey today!',
];

const ALL_SCHEDULED_HABITS_EXPIRED_NOTIFICATIONS = [
    "It's time to get back on track! Create a new habit today and get back to it!",
    "Come back, we're waiting for you! Start a new habit streak today!",
    'It’s never too late to start again. See you in the app!',
    'Don’t wait for the perfect moment, take the moment and make it perfect. Create a new habit today!',
    'Prove yourself right. Get back on track and create a new habit today!',
    'One day, or day one? You decide. Create a new habit and restart your journey today!',
];

const INACTIVE_SCHEDULED_HABITS_NOTIFICATIONS = [
    "It's time to get back on track! Create a new habit today and get back to it!",
    "Come back, we're waiting for you! Start a new habit streak today!",
    'It’s never too late to start again. See you in the app!',
    "Don’t wait for the perfect moment, take the moment and make it perfect. Let's get back to it!",
    'Prove yourself right. Get back on track and create a new habit today!',
    "One day, or day one? You decide. Let's get back to your habit streak!",
];

export class RetentionService {
    /*
     * User's who never created a habit
     */
    public static async notifyUsersWithNoScheduledHabits(context: Context) {
        const users = await UserService.getAllWithNoScheduledHabits(context);

        const pushNotifications = [];
        for (const user of users) {
            const pushNotification = this.notifyUserWithNoScheduledHabits(context, user);
            if (pushNotification) {
                pushNotifications.push(pushNotification);
            }
        }

        await PushNotificationService.sendPushNotifications(context, pushNotifications);
    }

    private static notifyUserWithNoScheduledHabits(context: Context, user: User) {
        const isTimeForNotification = UserTimezoneUtility.isHourOfDayForUser(
            NOTIFICATION_HOUR,
            user
        );
        if (!isTimeForNotification) {
            return undefined;
        }

        const randomInspirationalNotification =
            NO_SCHEDULED_HABIT_INSPIRATIONAL_NOTIFICATIONS[
            Math.floor(Math.random() * NO_SCHEDULED_HABIT_INSPIRATIONAL_NOTIFICATIONS.length)
            ];

        const pushNotification = PushNotificationService.createPushNotification(
            context,
            user,
            randomInspirationalNotification
        );

        return pushNotification;
    }

    /*
     * User's who had habits and no longer do
     */
    public static async notifyUsersWithAllExpiredScheduledHabits(context: Context) {
        const users = await UserService.getAllWithAllExpiredScheduledHabits(context);

        const pushNotifications = [];
        for (const user of users) {
            const pushNotification = this.notifyUserWithAllExpiredScheduledHabits(context, user);
            if (pushNotification) {
                pushNotifications.push(pushNotification);
            }
        }

        await PushNotificationService.sendPushNotifications(context, pushNotifications);
    }

    private static notifyUserWithAllExpiredScheduledHabits(context: Context, user: User) {
        const isTimeForNotification = UserTimezoneUtility.isHourOfDayForUser(
            NOTIFICATION_HOUR,
            user
        );
        if (!isTimeForNotification) {
            return undefined;
        }

        const randomExpiredNotification =
            ALL_SCHEDULED_HABITS_EXPIRED_NOTIFICATIONS[
            Math.floor(Math.random() * ALL_SCHEDULED_HABITS_EXPIRED_NOTIFICATIONS.length)
            ];

        const pushNotification = PushNotificationService.createPushNotification(
            context,
            user,
            randomExpiredNotification
        );

        return pushNotification;
    }

    /*
     * User's who have habits and are inactive
     */
    public static async notifyInactiveUsersWithScheduledHabits(context: Context) {
        const users = await UserService.getAllInactiveWithScheduledHabits(context);

        const pushNotifications = [];
        for (const user of users) {
            const pushNotification = this.notifyInactiveUserWithScheduledHabits(context, user);
            if (pushNotification) {
                pushNotifications.push(pushNotification);
            }
        }

        await PushNotificationService.sendPushNotifications(context, pushNotifications);
    }

    public static notifyInactiveUserWithScheduledHabits(context: Context, user: User) {
        const isTimeForNotification = UserTimezoneUtility.isHourOfDayForUser(
            NOTIFICATION_HOUR,
            user
        );
        if (!isTimeForNotification) {
            return undefined;
        }

        const randomExpiredNotification =
            INACTIVE_SCHEDULED_HABITS_NOTIFICATIONS[
            Math.floor(Math.random() * INACTIVE_SCHEDULED_HABITS_NOTIFICATIONS.length)
            ];

        const pushNotification = PushNotificationService.createPushNotification(
            context,
            user,
            randomExpiredNotification
        );

        return pushNotification;
    }
}
