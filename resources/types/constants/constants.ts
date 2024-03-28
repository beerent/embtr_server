export namespace Constants {
    export enum UserPropertyKey {
        TIME_ZONE = 'TIME_ZONE',
        HABIT_STREAK_CURRENT = 'HABIT_STREAK_CURRENT',
        HABIT_STREAK_LONGEST = 'HABIT_STREAK_LONGEST',
        NEW_USER_CHECKLIST_DISMISSED = 'NEW_USER_CHECKLIST_DISMISSED',
        NEW_USER_CHECKLIST_COMPLETED = 'NEW_USER_CHECKLIST_COMPLETED',
        INTRO_ACKNOWLEDGED = 'INTRO_ACKNOWLEDGED',
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
}
