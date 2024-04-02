import { User } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';

export class UserPropertyUtility {
    public static getProperty(user: User, key: Constants.UserPropertyKey) {
        const value = user.properties?.find((property) => property.key === key);
        return value;
    }
}
