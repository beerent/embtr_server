export namespace Constants {
    export enum UserPropertyKey {
        INVALID = 'INVALID',
        TIMEZONE = 'TIMEZONE',
        NEW_USER_CHECKLIST_DISMISSED = 'NEW_USER_CHECKLIST_DISMISSED',
        NEW_USER_CHECKLIST_COMPLETED = 'NEW_USER_CHECKLIST_COMPLETED',
        INTRO_ACKNOWLEDGED = 'INTRO_ACKNOWLEDGED',
        SOCIAL_NOTIFICATIONS_SETTING = 'SOCIAL_NOTIFICATIONS_SETTING',
        REMINDER_NOTIFICATIONS_SETTING = 'REMINDER_NOTIFICATIONS_SETTING',
        WARNING_NOTIFICATIONS_SETTING = 'WARNING_NOTIFICATIONS_SETTING',
        AWAY_MODE = 'AWAY_MODE',
        TUTORIAL_COMPLETED = 'TUTORIAL_COMPLETED',
        POINTS = 'POINTS',
        LEVEL = 'LEVEL',
    }

    export const getUserPropertyKey = (key: string): UserPropertyKey => {
        switch (key) {
            case 'TIMEZONE':
                return UserPropertyKey.TIMEZONE;
            case 'NEW_USER_CHECKLIST_DISMISSED':
                return UserPropertyKey.NEW_USER_CHECKLIST_DISMISSED;
            case 'NEW_USER_CHECKLIST_COMPLETED':
                return UserPropertyKey.NEW_USER_CHECKLIST_COMPLETED;
            case 'INTRO_ACKNOWLEDGED':
                return UserPropertyKey.INTRO_ACKNOWLEDGED;
            case 'AWAY_MODE':
                return UserPropertyKey.AWAY_MODE;
            case 'TUTORIAL_COMPLETED':
                return UserPropertyKey.TUTORIAL_COMPLETED;
            case 'INVALID':
                return UserPropertyKey.INVALID;
            case 'POINTS':
                return UserPropertyKey.POINTS;
            case 'LEVEL':
                return UserPropertyKey.LEVEL;

            default:
                return UserPropertyKey.INVALID;
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
        AWAY = 'AWAY',
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
            case 'AWAY':
                return CompletionState.AWAY;

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

    export enum AwayMode {
        INVALID = 'INVALID',
        ENABLED = 'ENABLED',
        DISABLED = 'DISABLED',
    }

    export const getAwayMode = (state: string): AwayMode => {
        switch (state) {
            case 'ENABLED':
                return AwayMode.ENABLED;
            case 'DISABLED':
                return AwayMode.DISABLED;

            default:
                return AwayMode.INVALID;
        }
    };

    export enum HabitStreakType {
        INVALID = 'INVALID',
        LONGEST = 'LONGEST',
        CURRENT = 'CURRENT',
    }

    export const getStreakType = (type: string): HabitStreakType => {
        switch (type) {
            case 'LONGEST':
                return HabitStreakType.LONGEST;
            case 'CURRENT':
                return HabitStreakType.CURRENT;

            default:
                return HabitStreakType.INVALID;
        }
    };

    export enum BadgeCategory {
        INVALID = 'INVALID',
        MEMBERSHIP = 'MEMBERSHIP',
        AWAY = 'AWAY',
        NEW_USER = 'NEW_USER',
        HABIT_STREAK_TIER = 'HABIT_STREAK_TIER',
    }

    export const getBadgeCategory = (category: string): BadgeCategory => {
        switch (category) {
            case 'MEMBERSHIP':
                return BadgeCategory.MEMBERSHIP;
            case 'AWAY':
                return BadgeCategory.AWAY;
            case 'NEW_USER':
                return BadgeCategory.NEW_USER;
            case 'HABIT_STREAK_TIER':
                return BadgeCategory.HABIT_STREAK_TIER;

            default:
                return BadgeCategory.INVALID;
        }
    };

    export enum PointDefinition {
        INVALID = 'INVALID',
        HABIT_COMPLETE = 'HABIT_COMPLETE',
        DAY_COMPLETE = 'DAY_COMPLETE',
        PLANNED_DAY_RESULT_CREATED = 'PLANNED_DAY_RESULT_CREATED',
    }

    export const getPointDefinition = (category: string): PointDefinition => {
        switch (category) {
            case 'HABIT_COMPLETE':
                return PointDefinition.HABIT_COMPLETE;
            case 'DAY_COMPLETE':
                return PointDefinition.DAY_COMPLETE;
            case 'PLANNED_DAY_RESULT_CREATED':
                return PointDefinition.PLANNED_DAY_RESULT_CREATED;

            default:
                return PointDefinition.INVALID;
        }
    };

    export enum PointTransactionType {
        INVALID = 'INVALID',
        ADD = 'ADD',
        SUBTRACT = 'SUBTRACT',
    }

    export const getPointTransactionType = (type: string): PointTransactionType => {
        switch (type) {
            case 'ADD':
                return PointTransactionType.ADD;
            case 'SUBTRACT':
                return PointTransactionType.SUBTRACT;

            default:
                return PointTransactionType.INVALID;
        }
    };

    export enum WebSocketEventType {
        INVALID = 'INVALID',
        FIRE_CONFETTI = 'FIRE_CONFETTI',
        LEVEL_DETAILS_UPDATED = 'LEVEL_DETAILS_UPDATED',
        POINTS_ADDED = 'POINTS_ADDED',
        POINTS_SUBTRACTED = 'POINTS_SUBTRACTED',
        DAY_COMPLETE = 'DAY_COMPLETE',
        HABIT_STREAK_UPDATED = 'HABIT_STREAK_UPDATED',
    }
}
