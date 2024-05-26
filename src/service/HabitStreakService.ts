import { PureDate } from '@resources/types/date/PureDate';
import { HabitStreak, HabitStreakResult } from '@resources/types/dto/HabitStreak';
import { Context } from '@src/general/auth/Context';
import { PlannedDayService } from './PlannedDayService';
import { DayKeyUtility } from '@src/utility/date/DayKeyUtility';
import { PlannedDay, ScheduledHabit } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { UserPropertyService } from './UserPropertyService';
import { PlannedDayDao } from '@src/database/PlannedDayDao';
import { DateUtility } from '@src/utility/date/DateUtility';
import { PlannedDayCommonService } from './common/PlannedDayCommonService';
import { ScheduledHabitService } from './ScheduledHabitService';
import { HabitStreakEventDispatcher } from '@src/event/habit_streak/HabitStreakEventDispatcher';
import { UserService } from './UserService';
import { ServiceException } from '@src/general/exception/ServiceException';
import { HttpCode } from '@src/common/RequestResponses';
import { Code } from '@resources/codes';

// "comment" - stronkbad - 2024-03-13

export class HabitStreakService {
    public static async getAdvanced(context: Context, userId: number): Promise<HabitStreak> {
        const userIsPremium = await UserService.isPremium(context, userId);
        if (!userIsPremium) {
            throw new ServiceException(HttpCode.FORBIDDEN, Code.FORBIDDEN, 'User is not premium');
        }

        const days = 209;
        const habitStreak = await this.getForDays(context, userId, days);
        return habitStreak;
    }

    public static async getBasic(context: Context, userId: number): Promise<HabitStreak> {
        const days = 30;

        const habitStreak = await this.getForDays(context, userId, days);
        return habitStreak;
    }

    public static async get(context: Context, userId: number, days: number): Promise<HabitStreak> {
        const habitStreak = await this.getForDays(context, userId, days);

        return habitStreak;
    }

    private static async getForDays(
        context: Context,
        userId: number,
        days: number
    ): Promise<HabitStreak> {
        const endDate = await this.getEndDateForUser(context, userId);

        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - days);

        const medianDate = new Date(endDate);
        medianDate.setDate(endDate.getDate() - Math.floor(days / 2));

        HabitStreakEventDispatcher.onRefresh(context, userId);

        // 1. get streak constants, schedules and plannedDays
        const [currentHabitStreak, lonestHabitStreak, plannedDays, scheduledHabits] =
            await Promise.all([
                this.getCurrentHabitStreak(context, userId),
                this.getLongestHabitStreak(context, userId),
                PlannedDayService.getAllInDateRange(context, userId, startDate, endDate),
                ScheduledHabitService.getAllForUserInDateRange(
                    context,
                    userId,
                    PureDate.fromDateOnServer(startDate),
                    PureDate.fromDateOnServer(endDate)
                ),
            ]);

        // 2. calculate the data for the habit graph
        const habitStreakResults: HabitStreakResult[] = await this.getHabitStreak(
            startDate,
            endDate,
            scheduledHabits,
            plannedDays
        );

        // 3. send it on back
        const habitStreak: HabitStreak = {
            startDate: PureDate.fromDateOnServer(startDate),
            medianDate: PureDate.fromDateOnServer(medianDate),
            endDate: PureDate.fromDateOnServer(endDate),

            currentStreak: currentHabitStreak,
            longestStreak: lonestHabitStreak,
            streakRank: 0,
            results: habitStreakResults,
        };

        return habitStreak;
    }

    // todo - consider passing in the statuses so we don't repeat the query
    public static async fullPopulateCurrentStreak(context: Context, userId: number) {
        let startDate = await this.getStartDateForUser(context, userId);
        const endDate = await this.getEndDateForUser(context, userId);
        if (startDate === undefined) {
            startDate = endDate;
        }

        const statuses = await PlannedDayDao.getCompletionStatusesForDateRange(
            userId,
            startDate,
            endDate
        );
        statuses.reverse();

        let completionCount = 0;
        for (const status of statuses) {
            if (status.status === Constants.CompletionState.COMPLETE) {
                completionCount++;
            } else if (
                status.status === Constants.CompletionState.NO_SCHEDULE ||
                status.status === null
            ) {
                continue;
            } else {
                break;
            }
        }

        console.log('Setting current habit streak to', completionCount);
        UserPropertyService.setCurrentHabitStreak(context, userId, completionCount);
    }

    public static async fullPopulateLongestStreak(context: Context, userId: number) {
        let startDate = await this.getStartDateForUser(context, userId);
        const endDate = await this.getEndDateForUser(context, userId);
        if (startDate === undefined) {
            startDate = endDate;
        }

        const statuses = await PlannedDayDao.getCompletionStatusesForDateRange(
            userId,
            startDate,
            endDate
        );

        let currentStreak = 0;
        let longestStreak = 0;
        for (const status of statuses) {
            if (status.status === Constants.CompletionState.COMPLETE) {
                currentStreak++;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            } else if (
                status.status === Constants.CompletionState.NO_SCHEDULE ||
                status.status === null
            ) {
                continue;
            } else {
                currentStreak = 0;
            }
        }

        console.log('Setting longest habit streak to', longestStreak);
        UserPropertyService.setLongestHabitStreak(context, userId, longestStreak);
    }

    private static async getStartDateForUser(context: Context, userId: number) {
        const plannedDay = await PlannedDayDao.getFirst(userId);
        return plannedDay?.date;
    }

    private static async getEndDateForUser(context: Context, userId: number) {
        const earliestPossibleEndDate = this.getLastCompletedDayInAllTimezones();
        const latestPossibleEndDate = this.getFirstCompletedDayInAllTimezones();

        const allDates = DateUtility.getAllDatesInBetween(
            earliestPossibleEndDate,
            latestPossibleEndDate
        );
        allDates.reverse();

        let currentDate = earliestPossibleEndDate;
        for (const date of allDates) {
            const dayKey = DayKeyUtility.getDayKey(date);
            const plannedDayExists = await PlannedDayService.exists(context, userId, dayKey);
            if (!plannedDayExists) {
                continue;
            }

            const completionStatus = await PlannedDayService.getCompletionStatus(
                context,
                userId,
                dayKey
            );

            if (
                completionStatus === Constants.CompletionState.COMPLETE ||
                completionStatus === Constants.CompletionState.NO_SCHEDULE ||
                completionStatus === Constants.CompletionState.FAILED
            ) {
                currentDate = date;
                break;
            }
        }

        return currentDate;
    }

    private static getLastCompletedDayInAllTimezones(): Date {
        const currentDate = new Date();
        const utc12Offset = -12 * 60; // UTC-12 offset in minutes
        const utc12Time = currentDate.getTime() + utc12Offset * 60 * 1000;
        const utc12Date = new Date(utc12Time);

        utc12Date.setDate(utc12Date.getDate() - 1);
        utc12Date.setUTCHours(0, 0, 0, 0);

        return utc12Date;
    }

    private static getFirstCompletedDayInAllTimezones(): Date {
        const currentDate = new Date();
        const utc14Offset = 14 * 60; // UTC-14 offset in minutes
        const utc14Time = currentDate.getTime() + utc14Offset * 60 * 1000;
        const utc14Date = new Date(utc14Time);

        utc14Date.setDate(utc14Date.getDate());
        utc14Date.setUTCHours(0, 0, 0, 0);

        return utc14Date;
    }

    private static async getHabitStreak(
        startDate: Date,
        endDate: Date,
        scheduledHabits: ScheduledHabit[],
        plannedDays: PlannedDay[]
    ) {
        const habitStreakResult: HabitStreakResult[] = [];
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const plannedDay = plannedDays.find(
                (plannedDay) => plannedDay.date?.toDateString() === date.toDateString()
            );

            const dayKey = DayKeyUtility.getDayKey(date);
            const completionState = this.getCompletionStateForPlannedDay(
                scheduledHabits,
                date,
                plannedDay
            );

            habitStreakResult.push({
                dayKey: dayKey,
                result: completionState,
            });
        }

        return habitStreakResult;
    }

    private static async getCurrentHabitStreak(context: Context, userId: number): Promise<number> {
        const currentStreak = await UserPropertyService.getCurrentHabitStreak(context, userId);

        if (!currentStreak) {
            return 0;
        }

        return currentStreak;
    }

    private static async getLongestHabitStreak(context: Context, userId: number): Promise<number> {
        const longestStreak = await UserPropertyService.getLongestHabitStreak(context, userId);

        if (!longestStreak) {
            return 0;
        }

        return longestStreak;
    }

    private static getCompletionStateForPlannedDay(
        scheduledHabits: ScheduledHabit[],
        date: Date,
        plannedDay?: PlannedDay
    ) {
        if (plannedDay?.status) {
            return Constants.getCompletionState(plannedDay.status);
        }

        // at this point we do not have a planned day, so if we have *any* scheduled habit, we have failed
        const scheduledHabitCount = PlannedDayCommonService.getScheduledActiveHabitCount(
            scheduledHabits,
            date
        );

        if (scheduledHabitCount > 0) {
            return Constants.CompletionState.FAILED;
        }

        return Constants.CompletionState.NO_SCHEDULE;
    }
}
