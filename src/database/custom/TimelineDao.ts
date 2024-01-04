import { TimelineElementType } from '@resources/types/requests/Timeline';
import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export interface TimelineQueryData {
    userPostIds: number[];
    plannedDayResultIds: number[];
}

interface QueryResults {
    id: number;
    source: TimelineElementType;
    createdAt: Date;
}

export class TimelineDao {
    public static async getByDateAndLimit(date: Date, limit: number): Promise<TimelineQueryData> {
        const result = await prisma.$queryRaw(
            Prisma.sql`
                SELECT id, 'PLANNED_DAY_RESULT' AS source, createdAt
                FROM planned_day_result
                WHERE createdAt < ${date}
                AND active = true
                UNION ALL
                SELECT id, 'USER_POST' AS source, createdAt
                FROM user_post
                WHERE createdAt < ${date}
                AND active = true
                ORDER BY createdAt DESC LIMIT ${limit}`
        );

        const userPostIds: number[] = [];
        const plannedDayResultIds: number[] = [];

        const typedResults = result as QueryResults[];
        for (const element of typedResults) {
            if (element.source === TimelineElementType.PLANNED_DAY_RESULT) {
                plannedDayResultIds.push(element.id);
            } else {
                userPostIds.push(element.id);
            }
        }

        return {
            userPostIds,
            plannedDayResultIds,
        };
    }
}
