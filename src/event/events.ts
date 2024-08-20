import { Constants } from '@resources/types/constants/constants';
import { UserContext } from '@src/general/auth/Context';
import { NotificationType } from '@src/service/NotificationService';

export namespace Event {
    export namespace PlannedDay {
        export const Updated = 'PLANNED_DAY_UPDATED';
        export const Completed = 'PLANNED_DAY_COMPLETED';
        export const Incompleted = 'PLANNED_DAY_INCOMPLETED';

        export class Event {
            context: UserContext;
            userId: number;
            dayKey: string;
            id: number;

            constructor(context: UserContext, userId: number, dayKey: string, id: number) {
                this.context = context;
                this.userId = userId;
                this.dayKey = dayKey;
                this.id = id;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.userId}_${this.dayKey}_${this.id}`;
            };
        }
    }

    export namespace PlannedDayResult {
        export const Created = 'PLANNED_DAY_RESULT_CREATED';
        export const Deleted = 'PLANNED_DAY_RESULT_DELETED';

        export class Event {
            context: UserContext;
            id: number;
            dayKey: string;

            constructor(context: UserContext, id: number, dayKey: string) {
                this.context = context;
                this.id = id;
                this.dayKey = dayKey;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.id}`;
            };
        }
    }

    export namespace PlannedHabit {
        export const Updated = 'PLANNED_HABIT_UPDATED';
        export const Created = 'PLANNED_HABIT_CREATED';
        export const Completed = 'PLANNED_HABIT_COMPLETED';
        export const Incompleted = 'PLANNED_HABIT_INCOMPLETED';

        export class Event {
            context: UserContext;
            id: number;
            habitId: number;
            dayKey: string;
            totalTimesOfDay?: number;

            constructor(
                context: UserContext,
                id: number,
                habitId: number,
                dayKey: string,
                totalTimesOfDay?: number
            ) {
                this.context = context;
                this.id = id;
                this.habitId = habitId;
                this.dayKey = dayKey;
                this.totalTimesOfDay = totalTimesOfDay;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.id}_${this.habitId}`;
            };
        }
    }

    export namespace UserProperty {
        export const Missing = 'USER_PROPERTY_MISSING';
        export const Updated = 'USER_PROPERTY_UPDATED';

        export class Event {
            context: UserContext;
            key: string;
            value?: string;

            constructor(context: UserContext, key: string, value?: string) {
                this.context = context;
                this.key = key;
                this.value = value;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.key}`;
            };
        }
    }

    export namespace HabitStreak {
        export const Refresh = 'HABIT_STREAK_REFRESH';

        export class Event {
            context: UserContext;
            userId: number;

            constructor(context: UserContext, userId: number) {
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
            context: UserContext;
            notificationType: NotificationType;
            fromUserId: number;
            toUserId: number;
            targetId: number;

            constructor(
                context: UserContext,
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
            context: UserContext;
            notificationType: NotificationType;
            fromUserId: number;
            toUserId: number;
            targetId: number;

            constructor(
                context: UserContext,
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
            context: UserContext;
            id: number;

            constructor(context: UserContext, id: number) {
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
            context: UserContext;
            plannedDayId: number;
            id: number;

            constructor(context: UserContext, plannedDayId: number, id: number) {
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
        export const Updated = 'USER_UPDATED';
        export const PremiumAdded = 'USER_PREMIUM_ADDED';
        export const PremiumRemoved = 'USER_PREMIUM_REMOVED';
        export const Away = 'USER_AWAY';
        export const Returned = 'USER_RETURNED';

        export class Event {
            context: UserContext;

            constructor(context: UserContext) {
                this.context = context;
            }

            public getKey = () => {
                return `${this.context.userId}`;
            };
        }
    }

    export namespace PointLedgerRecord {
        export const Updated = 'POINT_LEDGER_RECORD_UPDATED';

        export class Event {
            context: UserContext;
            relevantId: number;
            pointDefinitionType: Constants.PointDefinitionType;
            points: number;

            constructor(
                context: UserContext,
                relevantId: number,
                pointDefinitionType: Constants.PointDefinitionType,
                points: number
            ) {
                this.context = context;
                this.relevantId = relevantId;
                this.pointDefinitionType = pointDefinitionType;
                this.points = points;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.relevantId}_${this.pointDefinitionType}`;
            };
        }
    }

    export namespace Level {
        export const Updated = 'LEVEL_UPDATED';

        export class Event {
            context: UserContext;

            constructor(context: UserContext) {
                this.context = context;
            }

            public getKey = () => {
                return `${this.context.userId}`;
            };
        }
    }

    export namespace Timeline {
        export const Accessed = 'TIMELINE_ACCESSED';

        export class Event {
            context: UserContext;

            constructor(context: UserContext) {
                this.context = context;
            }

            public getKey = () => {
                return `${this.context.userId}`;
            };
        }
    }

    export namespace UserFeaturedPost {
        export const Accessed = 'USER_FEATURED_POST_ACCESSED';

        export class Event {
            context: UserContext;
            id: number;

            constructor(context: UserContext, id: number) {
                this.context = context;
                this.id = id;
            }

            public getKey = () => {
                return `${this.context.userId}_${this.id}`;
            };
        }
    }
}
