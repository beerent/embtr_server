import { User } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { UserPropertyUtility } from '@src/utility/UserPropertyUtility';
import { TimeOfDayUtility } from './TimeOfDayUtility';

export class UserTimezoneUtility {
    public static isHourOfDayForUser(hour: number, user: User) {
        const timezoneProperty = UserPropertyUtility.getProperty(
            user,
            Constants.UserPropertyKey.TIMEZONE
        );

        const timezone = timezoneProperty?.value ?? 'America/New_York';

        const isNotificationTime = TimeOfDayUtility.isHourOfDayForTimezone(hour, timezone);
        return isNotificationTime;
    }
}
