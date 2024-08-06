import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { CurrentUserLeaderboardElement } from '@resources/types/dto/Leaderboard';

export interface LeaderboardQueryResult {
    userId: number;
    points: number;
    position: number;
}

export interface LeaderboardQueryResults {
    leaderboard: LeaderboardQueryResult[];
    currentUserLeaderboardElement?: CurrentUserLeaderboardElement;
    summary?: string;
}

export class LeaderboardDao {
    public static async getByDateAndLimit(
        userId: number,
        startDate: Date,
        endDate: Date,
        limit: number
    ): Promise<LeaderboardQueryResults> {
        const startDateString = startDate.toISOString().split('T')[0];
        const endDateString = endDate.toISOString().split('T')[0];

        const [leaderboard, userRankResult] = await Promise.all([
            // Get the leaderboard
            prisma.$queryRaw<LeaderboardQueryResult[]>(
                Prisma.sql`
                SELECT
                    plr.userId,
                    SUM(plr.points) AS points
                FROM point_ledger_record plr
                JOIN
                    user u ON plr.userId = u.id
                LEFT JOIN
                    property p ON plr.userId = p.userId
                    AND p.key = 'SOCIAL_BLACKLIST'
                    AND p.value = 'ENABLED'
                WHERE
                    plr.createdAt BETWEEN ${startDateString} AND ${endDateString}
                    AND p.userId IS NULL
                GROUP BY
                    plr.userId
                ORDER BY
                    points DESC
                LIMIT ${limit}`
            ),

            // Get the user's rank
            prisma.$queryRaw<CurrentUserLeaderboardElement[]>(
                Prisma.sql`
            SELECT CAST(position AS UNSIGNED) AS position, points
            FROM (
                SELECT
                    userId,
                    SUM(points) AS points,
                    RANK() OVER (ORDER BY SUM(points) DESC) AS position 
                FROM point_ledger_record
                WHERE createdAt BETWEEN ${startDateString} AND ${endDateString}
                GROUP BY userId
            ) ranked_users
            WHERE userId = ${userId}`
            ),
        ]);

        const currentUserLeaderboardElement = userRankResult[0]
            ? {
                position: Number(userRankResult[0].position),
                points: userRankResult[0].points,
            }
            : undefined;

        return { leaderboard, currentUserLeaderboardElement };
    }
}
