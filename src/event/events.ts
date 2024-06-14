import { Context } from '@src/general/auth/Context';
import { NotificationType } from '@src/service/NotificationService';

export namespace Event {
    export namespace PlannedDay {
        export const Updated = 'PLANNED_DAY_UPDATED';

        export interface Event {
            context: Context;
            userId: number;
            id: number;
        }
    }

    export namespace PlannedHabit {
        export const Updated = 'PLANNED_HABIT_UPDATED';
        export const Created = 'PLANNED_HABIT_CREATED';
        export const Completed = 'PLANNED_HABIT_COMPLETED';
        export const Incompleted = 'PLANNED_HABIT_INCOMPLETED';

        export interface Event {
            context: Context;
            id: number;
            habitId: number;
        }
    }

    export namespace UserProperty {
        export const Missing = 'USER_PROPERTY_MISSING';

        export interface Event {
            context: Context;
            key: string;
        }
    }

    export namespace HabitStreak {
        export const Refresh = 'HABIT_STREAK_REFRESH';

        export interface Event {
            context: Context;
            userId: number;
        }
    }

    export namespace Comment {
        export const Created = 'COMMENT_CREATED';

        export interface Event {
            context: Context;
            notificationType: NotificationType;
            fromUserId: number;
            toUserId: number;
            targetId: number;
        }
    }

    export namespace Like {
        export const Created = 'LIKE_CREATED';

        export interface Event {
            context: Context;
            notificationType: NotificationType;
            fromUserId: number;
            toUserId: number;
            targetId: number;
        }
    }

    export namespace Challenge {
        export const Joined = 'CHALLENGE_CREATED';
        export const Left = 'CHALLENGE_LEFT';
        export const Completed = 'CHALLENGE_COMPLETED';
        export const Incompleted = 'CHALLENGE_INCOMPLETED';

        export interface Event {
            context: Context;
            id: number;
        }
    }

    export namespace ChallengeParticipant {
        export const ProgressIncreased = 'CHALLENGE_PARTICIPANT_PROGRESS_INCREASED';
        export const ProgressDecreased = 'CHALLENGE_PARTICIPANT_PROGRESS_DECREASED';

        export interface Event {
            context: Context;
            plannedDayId: number;
            id: number;
        }
    }
}
