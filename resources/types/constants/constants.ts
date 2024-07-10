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
    }

    export const getUserPropertyKey = (key: string): UserPropertyKey => {
        switch (key) {
            case 'TIME_ZONE':
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
        WEEK_COMPLETE = 'WEEK_COMPLETE',
        POST_CREATED = 'POST_CREATED',
        PLANNED_DAY_CREATED = 'PLANNED_DAY_CREATED',
        CHALLENGE_JOINED = 'CHALLENGE_JOINED',
        CHALLENGE_COMPLETE = 'CHALLENGE_COMPLETE',
        POST_COMMENTED_ON = 'POST_COMMENTED_ON',
        POST_LIKED = 'POST_LIKED',
        PLANNED_DAY_COMMENTED_ON = 'PLANNED_DAY_COMMENTED_ON',
        PLANNED_DAY_LIKED = 'PLANNED_DAY_LIKED',
        COMMENTED_ON_POST = 'COMMENTED_ON_POST',
        LIKED_POST = 'LIKED_POST',
        COMMENTED_ON_PLANNED_DAY = 'COMMENTED_ON_PLANNED_DAY',
        LIKED_PLANNED_DAY = 'LIKED_PLANNED_DAY',
    }

    export const getPointDefinition = (category: string): PointDefinition => {
        switch (category) {
            case 'HABIT_COMPLETE':
                return PointDefinition.HABIT_COMPLETE;
            case 'DAY_COMPLETE':
                return PointDefinition.DAY_COMPLETE;
            case 'WEEK_COMPLETE':
                return PointDefinition.WEEK_COMPLETE;
            case 'POST_CREATED':
                return PointDefinition.POST_CREATED;
            case 'PLANNED_DAY_CREATED':
                return PointDefinition.PLANNED_DAY_CREATED;
            case 'CHALLENGE_JOINED':
                return PointDefinition.CHALLENGE_JOINED;
            case 'CHALLENGE_COMPLETE':
                return PointDefinition.CHALLENGE_COMPLETE;
            case 'POST_COMMENTED_ON':
                return PointDefinition.POST_COMMENTED_ON;
            case 'POST_LIKED':
                return PointDefinition.POST_LIKED;
            case 'PLANNED_DAY_COMMENTED_ON':
                return PointDefinition.PLANNED_DAY_COMMENTED_ON;
            case 'PLANNED_DAY_LIKED':
                return PointDefinition.PLANNED_DAY_LIKED;
            case 'COMMENTED_ON_POST':
                return PointDefinition.COMMENTED_ON_POST;
            case 'LIKED_POST':
                return PointDefinition.LIKED_POST;
            case 'COMMENTED_ON_PLANNED_DAY':
                return PointDefinition.COMMENTED_ON_PLANNED_DAY;
            case 'LIKED_PLANNED_DAY':
                return PointDefinition.LIKED_PLANNED_DAY;

            default:
                return PointDefinition.INVALID;
        }
    };
}
