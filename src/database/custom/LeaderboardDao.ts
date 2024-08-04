import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export interface LeaderboardQueryResult {
    id: number;
    userName: string;
    displayName: string;
    profileUrl: string;
    points: number;
    position: number;
}

export class LeaderboardDao {
    public static async getByDateAndLimit(
        startDate: Date,
        endDate: Date,
        limit: number
    ): Promise<LeaderboardQueryResult[]> {
        const startDateString = startDate
            .toISOString()
            .replace('T', ' ')
            .replace('Z', '')
            .split(' ')[0];
        const endDateString = endDate
            .toISOString()
            .replace('T', ' ')
            .replace('Z', '')
            .split(' ')[0];

        const results: LeaderboardQueryResult[] = await prisma.$queryRaw(
            Prisma.sql`
            select userId, user.username, user.displayName, user.photoUrl, sum(points) points from point_ledger_record join user on userId = user.id where point_ledger_record.createdAt between ${startDateString} and ${endDateString} group by userId, username, displayName, photoUrl order by points desc limit ${limit}`
        );

        return results;
    }
}
