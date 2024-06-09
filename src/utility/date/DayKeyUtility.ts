import { PureDate } from '@resources/types/date/PureDate';
import { toZonedTime } from 'date-fns-tz';

export class DayKeyUtility {
    public static getDayKey(date: Date): string {
        let month = '' + (date.getMonth() + 1),
            day = '' + date.getDate(),
            year = date.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    public static getDayKeyFromPureDate(date: PureDate): string {
        return date.toString();
    }

    public static getTodayKey(): string {
        return this.getDayKey(new Date());
    }

    public static getDayKeyFromTimezone(timezone: string): string {
        const date = new Date();
        const zonedDate = toZonedTime(date, timezone);
        return this.getDayKey(zonedDate);
    }
}
