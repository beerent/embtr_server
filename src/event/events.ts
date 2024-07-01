import { Context } from '@src/general/auth/Context';
import { NotificationType } from '@src/service/NotificationService';

export namespace Event {
    export namespace PlannedDay {
        export const Updated = 'PLANNED_DAY_UPDATED';

        export class Event {
            context: Context;
            userId: number;
            id: number;

            constructor(context: Context, userId: number, id: number) {
                this.context = context;
                this.userId = userId;
                this.id = id;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.userId}_${this.id}`;
            };
        }
    }

    export namespace PlannedHabit {
        export const Updated = 'PLANNED_HABIT_UPDATED';
        export const Created = 'PLANNED_HABIT_CREATED';
        export const Completed = 'PLANNED_HABIT_COMPLETED';
        export const Incompleted = 'PLANNED_HABIT_INCOMPLETED';

        export class Event {
            context: Context;
            id: number;
            habitId: number;

            constructor(context: Context, id: number, habitId: number) {
                this.context = context;
                this.id = id;
                this.habitId = habitId;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.id}_${this.habitId}`;
            };
        }
    }

    export namespace UserProperty {
        export const Missing = 'USER_PROPERTY_MISSING';

        export class Event {
            context: Context;
            key: string;

            constructor(context: Context, key: string) {
                this.context = context;
                this.key = key;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.key}`;
            };
        }
    }

    export namespace HabitStreak {
        export const Refresh = 'HABIT_STREAK_REFRESH';

        export class Event {
            context: Context;
            userId: number;

            constructor(context: Context, userId: number) {
                this.context = context;
                this.userId = userId;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.userId}`;
            };
        }
    }

    export namespace Comment {
        export const Created = 'COMMENT_CREATED';

        export class Event {
            context: Context;
            notificationType: NotificationType;
            fromUserId: number;
            toUserId: number;
            targetId: number;

            constructor(
                context: Context,
                notificationType: NotificationType,
                fromUserId: number,
                toUserId: number,
                targetId: number
            ) {
                this.context = context;
                this.notificationType = notificationType;
                this.fromUserId = fromUserId;
                this.toUserId = toUserId;
                this.targetId = targetId;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.fromUserId}_${this.toUserId}_${this.targetId}`;
            };
        }
    }

    export namespace Like {
        export const Created = 'LIKE_CREATED';

        export class Event {
            context: Context;
            notificationType: NotificationType;
            fromUserId: number;
            toUserId: number;
            targetId: number;

            constructor(
                context: Context,
                notificationType: NotificationType,
                fromUserId: number,
                toUserId: number,
                targetId: number
            ) {
                this.context = context;
                this.notificationType = notificationType;
                this.fromUserId = fromUserId;
                this.toUserId = toUserId;
                this.targetId = targetId;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.fromUserId}_${this.toUserId}_${this.targetId}`;
            };
        }
    }

    export namespace Challenge {
        export const Joined = 'CHALLENGE_CREATED';
        export const Left = 'CHALLENGE_LEFT';
        export const Completed = 'CHALLENGE_COMPLETED';
        export const Incompleted = 'CHALLENGE_INCOMPLETED';

        export class Event {
            context: Context;
            id: number;

            constructor(context: Context, id: number) {
                this.context = context;
                this.id = id;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.id}`;
            };
        }
    }

    export namespace ChallengeParticipant {
        export const ProgressIncreased = 'CHALLENGE_PARTICIPANT_PROGRESS_INCREASED';
        export const ProgressDecreased = 'CHALLENGE_PARTICIPANT_PROGRESS_DECREASED';

        export class Event {
            context: Context;
            plannedDayId: number;
            id: number;

            constructor(context: Context, plannedDayId: number, id: number) {
                this.context = context;
                this.plannedDayId = plannedDayId;
                this.id = id;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.plannedDayId}_${this.id}`;
            };
        }
    }

    export namespace User {
        export const Created = 'USER_CREATED';
        export const PremiumAdded = 'USER_PREMIUM_ADDED';
        export const PremiumRemoved = 'USER_PREMIUM_REMOVED';
        export const Away = 'USER_AWAY';
        export const Returned = 'USER_RETURNED';

        export class Event {
            context: Context;

            constructor(context: Context) {
                this.context = context;
            }

            public getKey = () => {
                return `${this.context.userId}`;
            };
        }
    }
}
