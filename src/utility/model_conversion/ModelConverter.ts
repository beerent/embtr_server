import {
    Widget,
    WidgetType,
    User,
    Task,
    PlannedDay,
    PlannedTask,
    PlannedDayResult,
    Notification,
    UserPost,
    Metadata,
    QuoteOfTheDay,
    Season,
    Challenge,
    HabitCategory,
    ScheduledHabit,
    TimeOfDay,
    DayOfWeek,
    Property,
    Award,
    UserAward,
    Milestone,
    ChallengeMilestone,
    PlannedDayChallengeMilestone,
    ChallengeRequirement,
    Icon,
    Tag,
    IconCategory,
    Unit,
    HabitStreak,
    ChallengeParticipant,
    PushNotificationToken,
    Comment,
    Like,
    Badge,
    UserBadge,
    HabitStreakTier,
    Level,
    PointDefinition,
    PointLedgerRecord,
    Feature,
} from '@prisma/client';

import { sanitizeModel } from '@src/middleware/general/GeneralSanitation';

type PrismaModel =
    | User
    | Task
    | PlannedDay
    | PlannedTask
    | PlannedDayResult
    | UserPost
    | Notification
    | Widget
    | WidgetType
    | Metadata
    | QuoteOfTheDay
    | Season
    | Challenge
    | HabitCategory
    | ScheduledHabit
    | TimeOfDay
    | DayOfWeek
    | Property
    | Award
    | UserAward
    | Milestone
    | ChallengeMilestone
    | PlannedDayChallengeMilestone
    | ChallengeRequirement
    | Icon
    | Tag
    | IconCategory
    | Unit
    | HabitStreak
    | ChallengeParticipant
    | PushNotificationToken
    | Comment
    | Like
    | Badge
    | UserBadge
    | HabitStreakTier
    | Level
    | PointDefinition
    | PointLedgerRecord
    | Feature;

export class ModelConverter {
    public static convertAll<T>(prismaObj: PrismaModel[]): T[] {
        return prismaObj.map((obj) => this.convert<T>(obj));
    }

    public static convert<T>(prismaObj: PrismaModel, shouldSanitize: boolean = true): T {
        const convertObj = (obj: PrismaModel): T => {
            const convertedObj = obj as any;
            const dateFields = ['createdAt', 'updatedAt'];

            dateFields.forEach((field) => {
                if (convertedObj[field]) {
                    convertedObj[field] = new Date(convertedObj[field]);
                }
            });

            return convertedObj as T;
        };

        const converted = convertObj(prismaObj);
        const sanitized = shouldSanitize ? sanitizeModel(converted) : converted;
        return sanitized;
    }
}
