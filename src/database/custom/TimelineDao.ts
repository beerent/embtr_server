import { TimelineElementType } from '@resources/types/requests/Timeline';
import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export interface TimelineQueryData {
    userPostIds: number[];
    plannedDayResultIds: number[];
    challengeIds: number[];
    userFeaturedPostIds: number[];
}

interface QueryResults {
    id: number;
    source: TimelineElementType;
    createdAt: Date;
}

export class TimelineDao {
    public static async getUserPostsForUserByDateAndLimit(
        userId: number,
        date: Date,
        limit: number
    ): Promise<TimelineQueryData> {
        const r = await prisma.userPost.findMany({
            where: {
                userId: userId,
                createdAt: {
                    lt: date,
                },
                active: true,
            },
            select: {
                id: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        const queryResults: QueryResults[] = r.map((e) => {
            return {
                id: e.id,
                source: TimelineElementType.USER_POST,
                createdAt: e.createdAt,
            };
        });

        const builtResults = this.buildResults(queryResults);
        return builtResults;
    }

    public static async getPlannedDayResultsForUserByDateAndLimit(
        userId: number,
        date: Date,
        limit: number
    ): Promise<TimelineQueryData> {
        const r = await prisma.plannedDayResult.findMany({
            where: {
                plannedDay: {
                    user: {
                        id: userId,
                    },
                },
                createdAt: {
                    lt: date,
                },
                active: true,
            },
            select: {
                id: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        const queryResults: QueryResults[] = r.map((e) => {
            return {
                id: e.id,
                source: TimelineElementType.PLANNED_DAY_RESULT,
                createdAt: e.createdAt,
            };
        });

        const builtResults = this.buildResults(queryResults);
        return builtResults;
    }

    public static async getByDateAndLimit(
        userId: number,
        date: Date,
        limit: number
    ): Promise<TimelineQueryData> {
        const result: QueryResults[] = await prisma.$queryRaw(
            Prisma.sql`
                SELECT id, 'USER_FEATURED_POST' AS source, sortDate
                from user_featured_post
                WHERE (isViewed = False OR sortDate < ${date})
                  AND userId = ${userId}
                  AND active = true
                UNION ALL

                SELECT id, 'PLANNED_DAY_RESULT' AS source, createdAt as sortDate
                FROM planned_day_result
                WHERE createdAt < ${date}
                  AND active = true
                UNION ALL

                SELECT id, 'USER_POST' AS source, createdAt as sortDate
                FROM user_post
                WHERE createdAt < ${date}
                  AND active = true
                UNION ALL

                SELECT id, 'RECENTLY_JOINED_CHALLENGE' AS source, timelineTimestamp as sortDate
                FROM challenge
                WHERE timelineTimestamp < ${date}
                  AND active = true

                ORDER BY sortDate DESC LIMIT ${limit}`
        );
        const results = this.buildResults(result);
        return results;
    }

    private static buildResults = (queryResults: QueryResults[]) => {
        const userPostIds: number[] = [];
        const plannedDayResultIds: number[] = [];
        const challengeIds: number[] = [];
        const userFeaturedPostIds: number[] = [];

        for (const queryResult of queryResults) {
            if (queryResult.source === TimelineElementType.PLANNED_DAY_RESULT) {
                plannedDayResultIds.push(queryResult.id);
            } else if (queryResult.source === TimelineElementType.USER_POST) {
                userPostIds.push(queryResult.id);
            } else if (queryResult.source === TimelineElementType.RECENTLY_JOINED_CHALLENGE) {
                challengeIds.push(queryResult.id);
            } else if (queryResult.source === TimelineElementType.USER_FEATURED_POST) {
                userFeaturedPostIds.push(queryResult.id);
            }
        }

        return {
            userPostIds,
            plannedDayResultIds,
            challengeIds,
            userFeaturedPostIds,
        };
    };
}
