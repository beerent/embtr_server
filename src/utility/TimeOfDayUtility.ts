import { Constants } from '@resources/types/constants/constants';

export namespace TimeOfDayUtility {
    export const getPeriodPretty = (period: Constants.Period): string => {
        const periodPretty = period.charAt(0).toUpperCase() + period.slice(1).toLowerCase();
        return periodPretty;
    };
}
