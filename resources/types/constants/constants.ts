export namespace Constants {
    export enum UserPropertyKey {
        TIME_ZONE = 'TIME_ZONE',
        HABIT_STREAK_CURRENT = 'HABIT_STREAK_CURRENT',
        HABIT_STREAK_LONGEST = 'HABIT_STREAK_LONGEST',
        NEW_USER_CHECKLIST_DISMISSED = 'NEW_USER_CHECKLIST_DISMISSED',
        NEW_USER_CHECKLIST_COMPLETED = 'NEW_USER_CHECKLIST_COMPLETED',
        INTRO_ACKNOWLEDGED = 'INTRO_ACKNOWLEDGED',
        SOCIAL_NOTIFICATIONS_SETTING = 'SOCIAL_NOTIFICATIONS_SETTING',
        REMINDER_NOTIFICATIONS_SETTING = 'REMINDER_NOTIFICATIONS_SETTING',
    }

    export const getUserPropertyKey = (key: string): UserPropertyKey => {
        switch (key) {
            case 'TIME_ZONE':
                return UserPropertyKey.TIME_ZONE;
            case 'HABIT_STREAK_CURRENT':
                return UserPropertyKey.HABIT_STREAK_CURRENT;
            case 'HABIT_STREAK_LONGEST':
                return UserPropertyKey.HABIT_STREAK_LONGEST;
            case 'NEW_USER_CHECKLIST_DISMISSED':
                return UserPropertyKey.NEW_USER_CHECKLIST_DISMISSED;
            case 'NEW_USER_CHECKLIST_COMPLETED':
                return UserPropertyKey.NEW_USER_CHECKLIST_COMPLETED;
            case 'INTRO_ACKNOWLEDGED':
                return UserPropertyKey.INTRO_ACKNOWLEDGED;

            default:
                return UserPropertyKey.HABIT_STREAK_CURRENT;
        }
    };

    /*
     * COMPLETION STATES
     */
    export enum CompletionState {
        INVALID = 'INVALID',
        COMPLETE = 'COMPLETE',
        INCOMPLETE = 'INCOMPLETE',
        FAILED = 'FAILED',
        SKIPPED = 'SKIPPED',
        NO_SCHEDULE = 'NO_SCHEDULE',
    }
    export const getCompletionState = (state: string): CompletionState => {
        switch (state) {
            case 'COMPLETE':
                return CompletionState.COMPLETE;
            case 'INCOMPLETE':
                return CompletionState.INCOMPLETE;
            case 'FAILED':
                return CompletionState.FAILED;
            case 'SKIPPED':
                return CompletionState.SKIPPED;
            case 'NO_SCHEDULE':
                return CompletionState.NO_SCHEDULE;

            default:
                return CompletionState.INVALID;
        }
    };

    /*
     * SOCIAL NOTIFICATIONS SETTING
     */
    export enum SocialNotificationsSetting {
        INVALID = 'INVALID',
        ENABLED = 'ENABLED',
        DISABLED = 'DISABLED',
    }

    export const getSocialNotificationsSetting = (state: string): SocialNotificationsSetting => {
        switch (state) {
            case 'ENABLED':
                return SocialNotificationsSetting.ENABLED;
            case 'DISABLED':
                return SocialNotificationsSetting.DISABLED;

            default:
                return SocialNotificationsSetting.INVALID;
        }
    };

    /*
     * REMINDER NOTIFICATIONS SETTING
     */
    export enum ReminderNotificationsSetting {
        INVALID = 'INVALID',
        DISABLED = 'DISABLED',
        DAILY = 'DAILY',
        PERIODICALLY = 'PERIODICALLY',
    }

    export const getReminderNotificationsSetting = (
        state: string
    ): ReminderNotificationsSetting => {
        switch (state) {
            case 'DISABLED':
                return ReminderNotificationsSetting.DISABLED;
            case 'DAILY':
                return ReminderNotificationsSetting.DAILY;
            case 'PERIODICALLY':
                return ReminderNotificationsSetting.PERIODICALLY;

            default:
                return ReminderNotificationsSetting.INVALID;
        }
    };
}
