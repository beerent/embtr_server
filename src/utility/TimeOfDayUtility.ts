import { Constants } from '@resources/types/constants/constants';

export namespace TimeOfDayUtility {
    export const getPeriodPretty = (period: Constants.Period): string => {
        const periodPretty = period.charAt(0).toUpperCase() + period.slice(1).toLowerCase();
        return periodPretty;
    };

    export const isHourOfDayForTimezone = (hour: number, timezone: string): boolean => {
        const currentTime = new Date();
        const usersHour = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: timezone,
        }).format(currentTime);

        //console.log('timezone', timezone, 'hour', hour, 'usersHour', usersHour);
        return usersHour === hour.toString();
    };
}
