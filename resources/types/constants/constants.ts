export namespace Constants {
    export enum UserPropertyKey {
        TIMEZONE = 'TIMEZONE',
        HABIT_STREAK_CURRENT = 'HABIT_STREAK_CURRENT',
        HABIT_STREAK_LONGEST = 'HABIT_STREAK_LONGEST',
        NEW_USER_CHECKLIST_DISMISSED = 'NEW_USER_CHECKLIST_DISMISSED',
        NEW_USER_CHECKLIST_COMPLETED = 'NEW_USER_CHECKLIST_COMPLETED',
        INTRO_ACKNOWLEDGED = 'INTRO_ACKNOWLEDGED',
        SOCIAL_NOTIFICATIONS_SETTING = 'SOCIAL_NOTIFICATIONS_SETTING',
        REMINDER_NOTIFICATIONS_SETTING = 'REMINDER_NOTIFICATIONS_SETTING',
        WARNING_NOTIFICATIONS_SETTING = 'WARNING_NOTIFICATIONS_SETTING',
    }

    export const getUserPropertyKey = (key: string): UserPropertyKey => {
        switch (key) {
            case 'TIME_ZONE':
                return UserPropertyKey.TIMEZONE;
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
    export enum SocialNotificationSetting {
        INVALID = 'INVALID',
        ENABLED = 'ENABLED',
        DISABLED = 'DISABLED',
    }

    export const getSocialNotificationsSetting = (state: string): SocialNotificationSetting => {
        switch (state) {
            case 'ENABLED':
                return SocialNotificationSetting.ENABLED;
            case 'DISABLED':
                return SocialNotificationSetting.DISABLED;

            default:
                return SocialNotificationSetting.INVALID;
        }
    };

    /*
     * REMINDER NOTIFICATIONS SETTING
     */
    export enum ReminderNotificationSetting {
        INVALID = 'INVALID',
        DISABLED = 'DISABLED',
        DAILY = 'DAILY',
        PERIODICALLY = 'PERIODICALLY',
    }

    export const getReminderNotificationsSetting = (state: string): ReminderNotificationSetting => {
        switch (state) {
            case 'DISABLED':
                return ReminderNotificationSetting.DISABLED;
            case 'DAILY':
                return ReminderNotificationSetting.DAILY;
            case 'PERIODICALLY':
                return ReminderNotificationSetting.PERIODICALLY;

            default:
                return ReminderNotificationSetting.INVALID;
        }
    };

    export enum WarningNotificationSetting {
        INVALID = 'INVALID',
        DISABLED = 'DISABLED',
        DAILY = 'DAILY',
        PERIODICALLY = 'PERIODICALLY',
    }

    export const getWarningNotificationSetting = (state: string): WarningNotificationSetting => {
        switch (state) {
            case 'DISABLED':
                return WarningNotificationSetting.DISABLED;
            case 'DAILY':
                return WarningNotificationSetting.DAILY;
            case 'PERIODICALLY':
                return WarningNotificationSetting.PERIODICALLY;

            default:
                return WarningNotificationSetting.INVALID;
        }
    };

    export enum Period {
        INVALID = 'INVALID',
        MORNING = 'MORNING',
        AFTERNOON = 'AFTERNOON',
        EVENING = 'EVENING',
        NIGHT = 'NIGHT',
        DEFAULT = 'DEFAULT',
    }

    export const getPeriod = (period: string): Period => {
        switch (period) {
            case 'MORNING':
                return Period.MORNING;
            case 'AFTERNOON':
                return Period.AFTERNOON;
            case 'EVENING':
                return Period.EVENING;
            case 'NIGHT':
                return Period.NIGHT;
            case 'DEFAULT':
                return Period.DEFAULT;

            default:
                return Period.INVALID;
        }
    };

    export enum TaskType {
        INVALID = 'INVALID',
        DEFAULT = 'DEFAULT',
        CHALLENGE = 'CHALLENGE',
    }

    export const getScheduledHabitType = (type: string): TaskType => {
        switch (type) {
            case 'DEFAULT':
                return TaskType.DEFAULT;
            case 'CHALLENGE':
                return TaskType.CHALLENGE;
        }

        return TaskType.INVALID;
    };
}
