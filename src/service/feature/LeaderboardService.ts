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
        for (let i = 0; i < leaderboardData.leaderboard.length; i++) {
            const user: User = { ...leaderboardData.leaderboard[i] };
            const position = i + 1;
            const points = leaderboardData.leaderboard[i].points;

            const leaderboardElement: LeaderboardElement = { user, position, points };
            leaderboardElements.push(leaderboardElement);
        }

        const leaderboard: Leaderboard = {
            entries: leaderboardElements,
            currentUserLeaderboardElement: leaderboardData.currentUserLeaderboardElement,
            summary: leaderboardData.summary ?? '',
        };

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

        const leaderboardQueryResults = await LeaderboardDao.getByDateAndLimit(
            context.userId,
            startDate,
            endDate,
            10
        );

        leaderboardQueryResults.summary = "Today's leaderboard";

        return leaderboardQueryResults;
    }

    private static async getWeekLeaderboard(context: Context) {
        const currentDateTime = context.dateTime;

        // Set the startDate to the current date with time set to midnight
        const startDate = new Date(currentDateTime);
        startDate.setHours(0, 0, 0, 0);

        // Adjust startDate to the previous Monday
        while (startDate.getDay() !== 1) {
            startDate.setDate(startDate.getDate() - 1);
        }

        // Set the endDate to 7 days after the startDate
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const leaderboardQueryResults = await LeaderboardDao.getByDateAndLimit(
            context.userId,
            startDate,
            endDate,
            10
        );

        // Calculate the week number of the current month
        let firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

        // If the startDate is from the previous month, adjust firstDayOfMonth to the first day of the current month
        if (startDate.getMonth() !== endDate.getMonth()) {
            firstDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        }

        const pastDaysOfMonth =
            (startDate.getTime() - firstDayOfMonth.getTime()) / (24 * 60 * 60 * 1000);
        const weekNumber = Math.ceil((pastDaysOfMonth + firstDayOfMonth.getDay() + 1) / 7);

        // Function to get ordinal suffix
        const getOrdinalSuffix = (num: number) => {
            const suffixes = ['th', 'st', 'nd', 'rd'];
            const value = num % 100;
            return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
        };

        const weekNumberWithSuffix = `${weekNumber}${getOrdinalSuffix(weekNumber)}`;

        const monthName = endDate.toLocaleString('default', { month: 'long' });
        leaderboardQueryResults.summary = `The leaderboard for the ${weekNumberWithSuffix} week of ${monthName}`;

        return leaderboardQueryResults;
    }

    private static async getMonthLeaderboard(context: Context) {
        const currentDateTime = context.dateTime;

        const startDate = new Date(currentDateTime);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const leaderboardQueryResults = await LeaderboardDao.getByDateAndLimit(
            context.userId,
            startDate,
            endDate,
            10
        );

        const currentMonthString = startDate.toLocaleString('default', { month: 'long' });
        leaderboardQueryResults.summary = `The leaderboard for the month of ${currentMonthString}`;

        return leaderboardQueryResults;
    }

    private static async getAllTimeLeaderboard(context: Context) {
        const startDate = new Date('2024-07-01');
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(0, 0, 0, 0);

        const leaderboardQueryResults = await LeaderboardDao.getByDateAndLimit(
            context.userId,
            startDate,
            endDate,
            10
        );

        leaderboardQueryResults.summary = 'The all-time embtr. leaderboard';

        return leaderboardQueryResults;
    }
}
