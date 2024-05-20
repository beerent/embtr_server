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
} from '@prisma/client';

import { sanitizeModel } from '@src/middleware/general/GeneralSanitation';
import { Unit } from '@resources/schema';

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
    | Unit
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
    | ChallengeRequirement;

export class ModelConverter {
    public static convertAll<T>(prismaObj: PrismaModel[]): T[] {
        return prismaObj.map(this.convert<T>);
    }

    public static convert<T>(prismaObj: PrismaModel): T {
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
        const sanitized = sanitizeModel(converted);
        return sanitized;
    }
}
