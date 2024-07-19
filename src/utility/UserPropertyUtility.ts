import { User } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';

export class UserPropertyUtility {
    public static ALLOWED_PROPERTIES = [
        Constants.UserPropertyKey.AWAY_MODE.toString(),
        Constants.UserPropertyKey.TUTORIAL_COMPLETED.toString(),
        Constants.UserPropertyKey.POINTS.toString(),
        Constants.UserPropertyKey.LEVEL.toString(),
    ];

    public static getLevel(user: User) {
        const levelProperty = this.getProperty(user, Constants.UserPropertyKey.LEVEL);
        const levelNumber = parseInt(levelProperty?.value ?? '0', 10);

        return levelNumber;
    }

    public static getPoints(user: User) {
        const pointsProperty = this.getProperty(user, Constants.UserPropertyKey.POINTS);
        const points = parseInt(pointsProperty?.value ?? '0', 10);

        return points;
    }

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

    public static isAwayModeEnabled(user: User) {
        const awayModeProperty = this.getProperty(user, Constants.UserPropertyKey.AWAY_MODE);
        return awayModeProperty?.value === Constants.AwayMode.ENABLED;
    }
}
