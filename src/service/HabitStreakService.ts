import { PureDate } from '@resources/types/date/PureDate';
import { HabitStreak, HabitStreakResult } from '@resources/types/dto/HabitStreak';
import { Context } from '@src/general/auth/Context';
import { PlannedDayService } from './PlannedDayService';
import { DayKeyUtility } from '@src/utility/date/DayKeyUtility';
import { ScheduledHabitService } from './ScheduledHabitService';
import { PlannedDay, Property, ScheduledHabit } from '@resources/schema';
import { PlannedDayCommonService } from './common/PlannedDayCommonService';
import { Constants } from '@resources/types/constants/constants';
import { UserPropertyKey, UserPropertyService } from './UserPropertyService';
import { HabitStreakEvents } from '@src/event/HabitStreakEvents';
import eventBus from '@src/event/eventBus';
import { PlannedDayDao } from '@src/database/PlannedDayDao';

// "comment" - stronkbad - 2024-03-13

export class HabitStreakService {
    public static async get(context: Context, userId: number): Promise<HabitStreak> {
        const days = 30;

        const endDate = await this.getEndDateForUser(context, userId);

        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - days);

        const medianDate = new Date(endDate);
        medianDate.setDate(endDate.getDate() - Math.floor(days / 2));

        const habitSchedulesInDateRange = await ScheduledHabitService.getForDayOfWeekInDateRange(
            context,
            userId,
            PureDate.fromDateOnServer(startDate),
            PureDate.fromDateOnServer(endDate)
        );

        const plannedDaysInDateRange = await PlannedDayService.getInDateRange(
            context,
            userId,
            startDate,
            endDate
        );

        const habitStreakResults: HabitStreakResult[] = this.getHabitStreak(
            startDate,
            endDate,
            habitSchedulesInDateRange,
            plannedDaysInDateRange
        );

        let currentHabitStreak = await this.getCurrentHabitStreak(context, userId);

        const habitStreak: HabitStreak = {
            startDate: PureDate.fromDateOnServer(startDate),
            medianDate: PureDate.fromDateOnServer(medianDate),
            endDate: PureDate.fromDateOnServer(endDate),

            currentStreak: currentHabitStreak,
            longestStreak: 0,
            streakRank: 0,
            results: habitStreakResults,
        };

        return habitStreak;
    }

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
            } else {
                break;
            }
        }

        const key: UserPropertyKey = UserPropertyKey.HABIT_STREAK_CURRENT;
        const property: Property = {
            key,
            value: completionCount.toString(),
        };

        UserPropertyService.set(context, property);
    }

    private static async getStartDateForUser(context: Context, userId: number) {
        const plannedDay = await PlannedDayDao.getFirst(userId);
        return plannedDay?.date;
    }

    private static async getEndDateForUser(context: Context, userId: number) {
        const earliestPossibleEndDate = this.getLastCompletedDayInAllTimezones();
        const latestPossibleEndDate = this.getFirstCompletedDayInAllTimezones();
        const latestPossibleEndDayKey = DayKeyUtility.getDayKey(latestPossibleEndDate);

        const latestIsComplete = await PlannedDayService.getIsComplete(
            context,
            userId,
            latestPossibleEndDayKey
        );

        if (latestIsComplete) {
            return latestPossibleEndDate;
        }

        return earliestPossibleEndDate;
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

        utc14Date.setDate(utc14Date.getDate() - 1);
        utc14Date.setUTCHours(0, 0, 0, 0);

        return utc14Date;
    }

    private static getHabitStreak(
        startDate: Date,
        endDate: Date,
        scheduledHabits: ScheduledHabit[],
        plannedDays: PlannedDay[]
    ) {
        const endDateUtc = new Date(endDate);
        endDateUtc.setUTCHours(0, 0, 0, 0);

        const startDateUtc = new Date(startDate);
        startDateUtc.setUTCHours(0, 0, 0, 0);

        const habitStreakResult: HabitStreakResult[] = [];
        for (let d = new Date(startDateUtc); d <= endDateUtc; d.setDate(d.getDate() + 1)) {
            const day = plannedDays.find(
                (plannedDay) => plannedDay.date?.toDateString() === d.toDateString()
            );
            const dayKey = DayKeyUtility.getDayKey(d);

            const completionState: Constants.CompletionState =
                PlannedDayCommonService.generateCompletionState(scheduledHabits, d, day);

            habitStreakResult.push({
                dayKey,
                result: completionState,
            });
        }

        return habitStreakResult;
    }

    private static async getCurrentHabitStreak(context: Context, userId: number): Promise<number> {
        const key: UserPropertyKey = UserPropertyKey.HABIT_STREAK_CURRENT;
        const currentStreakProperty = await UserPropertyService.get(context, userId, key);

        if (currentStreakProperty === undefined) {
            this.emitBackPopulateCurrentHabitStreak(context, userId);
            return 0;
        }

        const valueString = currentStreakProperty.value;
        if (valueString === undefined) {
            this.emitBackPopulateCurrentHabitStreak(context, userId);
            return 0;
        }

        const value = parseInt(valueString);
        if (isNaN(value)) {
            this.emitBackPopulateCurrentHabitStreak(context, userId);
            return 0;
        }

        return value;
    }

    private static async emitBackPopulateCurrentHabitStreak(context: Context, userId: number) {
        const option = HabitStreakEvents.Option.FULL_POPULATE_CURRENT_STREAK;
        const type: HabitStreakEvents.Type.FullPopulateCurrentStreakEvent = {
            context,
            userId,
        };

        eventBus.emit(option, type);
    }
}
