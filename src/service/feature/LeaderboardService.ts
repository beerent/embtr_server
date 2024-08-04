import { User } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { Leaderboard, LeaderboardElement } from '@resources/types/dto/Leaderboard';
import { LeaderboardDao } from '@src/database/custom/LeaderboardDao';
import { Context } from '@src/general/auth/Context';

// "As a troll, I respect him. As thedevdad_, I hate him." - thedevdad_ - TheCaptainCoder - 2024-08-03

export class LeaderboardService {
    public static async get(context: Context, type: Constants.LeaderboardType) {
        const leaderboardData = await this.getLeaderboardData(context, type);
        if (!leaderboardData) {
            return undefined;
        }

        const leaderboardElements: LeaderboardElement[] = [];
        for (let i = 0; i < leaderboardData.length; i++) {
            const user: User = { ...leaderboardData[i] };
            const position = i + 1;
            const points = leaderboardData[i].points;

            const leaderboardElement: LeaderboardElement = { user, position, points };
            leaderboardElements.push(leaderboardElement);
        }

        const leaderboard: Leaderboard = { entries: leaderboardElements };
        return leaderboard;
    }

    private static async getLeaderboardData(context: Context, type: Constants.LeaderboardType) {
        switch (type) {
            case Constants.LeaderboardType.TODAY:
                return this.getTodayLeaderboard(context);
            case Constants.LeaderboardType.WEEK:
                return this.getWeekLeaderboard(context);
            case Constants.LeaderboardType.MONTH:
                return this.getMonthLeaderboard(context);
            case Constants.LeaderboardType.ALL_TIME:
                return this.getAllTimeLeaderboard(context);
        }

        return undefined;
    }

    private static async getTodayLeaderboard(context: Context) {
        const startDate = context.dateTime;
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const leaderboardEntries = await LeaderboardDao.getByDateAndLimit(startDate, endDate, 10);
        return leaderboardEntries;
    }

    private static async getWeekLeaderboard(context: Context) {
        const startDate = context.dateTime;
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const leaderboardEntries = await LeaderboardDao.getByDateAndLimit(startDate, endDate, 10);
        return leaderboardEntries;
    }

    private static async getMonthLeaderboard(context: Context) {
        const startDate = context.dateTime;
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const leaderboardEntries = await LeaderboardDao.getByDateAndLimit(startDate, endDate, 10);
        return leaderboardEntries;
    }

    private static async getAllTimeLeaderboard(context: Context) {
        const leaderboardEntries = LeaderboardDao.getByDateAndLimit(new Date(0), new Date(), 10);
        return leaderboardEntries;
    }
}
