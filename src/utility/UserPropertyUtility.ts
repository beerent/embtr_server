import { User } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';

export class UserPropertyUtility {
    public static ALLOWED_PROPERTIES = [Constants.UserPropertyKey.AWAY_MODE.toString()];

    public static getProperty(user: User, key: Constants.UserPropertyKey) {
        const value = user.properties?.find((property) => property.key === key);
        return value;
    }

    public static filterAllowedProperties(user: User) {
        const allowedProperties = [Constants.UserPropertyKey.AWAY_MODE.toString()];
        for (const property of user.properties || []) {
            if (!allowedProperties.includes(property.key ?? '')) {
                delete property.value;
            }
        }
    }
}
