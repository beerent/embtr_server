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
        OPERATING_SYSTEM = 'OPERATING_SYSTEM',
        SOCIAL_BLACKLIST = 'SOCIAL_BLACKLIST',
        FEATURE_VOTE = 'FEATURE_VOTE',
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
            case 'OPERATING_SYSTEM':
                return UserPropertyKey.OPERATING_SYSTEM;
            case 'SOCIAL_BLACKLIST':
                return UserPropertyKey.SOCIAL_BLACKLIST;
            case 'FEATURE_VOTE':
                return UserPropertyKey.FEATURE_VOTE;

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
        LEVEL = 'LEVEL',
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
            case 'LEVEL':
                return BadgeCategory.LEVEL;

            default:
                return BadgeCategory.INVALID;
        }
    };

    export enum PointDefinitionType {
        INVALID = 'INVALID',
        HABIT_COMPLETE = 'HABIT_COMPLETE',
        DAY_COMPLETE = 'DAY_COMPLETE',
        PLANNED_DAY_RESULT_CREATED = 'PLANNED_DAY_RESULT_CREATED',
    }

    export const getPointDefinition = (category: string): PointDefinitionType => {
        switch (category) {
            case 'HABIT_COMPLETE':
                return PointDefinitionType.HABIT_COMPLETE;
            case 'DAY_COMPLETE':
                return PointDefinitionType.DAY_COMPLETE;
            case 'PLANNED_DAY_RESULT_CREATED':
                return PointDefinitionType.PLANNED_DAY_RESULT_CREATED;

            default:
                return PointDefinitionType.INVALID;
        }
    };

    export enum WebSocketEventType {
        INVALID = 'INVALID',
        FIRE_CONFETTI = 'FIRE_CONFETTI',
        LEVEL_DETAILS_UPDATED = 'LEVEL_DETAILS_UPDATED',
        DAY_COMPLETE = 'DAY_COMPLETE',
        DAY_INCOMPLETE = 'DAY_INCOMPLETE',
        HABIT_STREAK_UPDATED = 'HABIT_STREAK_UPDATED',
        USER_UPDATED = 'USER_UPDATED',
    }

    export enum OperatingSystemCategory {
        INVALID = 'INVALID',
        IOS = 'IOS',
        ANDROID = 'ANDROID',
    }

    export const getOperatingSystemCategory = (category: string): OperatingSystemCategory => {
        switch (category) {
            case 'IOS':
                return OperatingSystemCategory.IOS;
            case 'ANDROID':
                return OperatingSystemCategory.ANDROID;

            default:
                return OperatingSystemCategory.INVALID;
        }
    };

    export enum DataDrivenDetailType {
        INVALID = 'INVALID',
        POINTS = 'POINTS',
    }

    export enum MetadataKey {
        INVALID = 'INVALID',
        QUOTE_OF_THE_DAY = 'QUOTE_OF_THE_DAY',
        DATA_DRIVEN_DETAILS_VERSION = 'DATA_DRIVEN_DETAILS_VERSION',
    }

    export enum LeaderboardType {
        INVALID = 'INVALID',
        TODAY = 'TODAY',
        WEEK = 'WEEK',
        MONTH = 'MONTH',
        ALL_TIME = 'ALL_TIME',
    }

    export const getLeaderboardType = (type: string): LeaderboardType => {
        switch (type) {
            case 'TODAY':
                return LeaderboardType.TODAY;
            case 'WEEK':
                return LeaderboardType.WEEK;
            case 'MONTH':
                return LeaderboardType.MONTH;
            case 'ALL_TIME':
                return LeaderboardType.ALL_TIME;

            default:
                return LeaderboardType.INVALID;
        }
    };

    export enum BooleanState {
        INVALID = 'INVALID',
        ENABLED = 'ENABLED',
        DISABLED = 'DISABLED',
    }

    export const getBooleanState = (state: string): BooleanState => {
        switch (state) {
            case 'ENABLED':
                return BooleanState.ENABLED;
            case 'DISABLED':
                return BooleanState.DISABLED;

            default:
                return BooleanState.INVALID;
        }
    };

    export enum Interactable {
        USER_POST,
        PLANNED_DAY_RESULT,
        QUOTE_OF_THE_DAY,
        CHALLENGE,
        FEATURED_POST,
    }
}
