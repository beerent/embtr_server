import { User, Icon } from '@resources/schema';
import { LevelDetails } from '@resources/types/dto/Level';
import { Context } from '@src/general/auth/Context';
import { UserPropertyUtility } from '@src/utility/UserPropertyUtility';
import { PointTierService } from '../PointTierService';
import { UserPropertyService } from '../UserPropertyService';
import { UserService } from '../UserService';
import { WebSocketService } from '../WebSocketService';

export class LevelService {
    public static async recalculateLevel(context: Context) {
        const points = await UserPropertyService.getPoints(context);
        const pointTier = await PointTierService.getByPoints(points);
        if (!pointTier?.level) {
            return 0;
        }

        console.log(`Setting level to ${pointTier.level}`);
        await UserPropertyService.setLevel(context, pointTier.level);
    }

    public static async getDetails(context: Context, userId: number) {
        const user: User = await UserService.getById(context, userId);
        const level = UserPropertyUtility.getLevel(user);
        const points = UserPropertyUtility.getPoints(user);

        const icon = await this.getLevelIcon(level);
        if (!icon) {
            return undefined;
        }

        const pointsToNextLevel = await this.getPointsToNextLevel(level, points);

        const levelDetails: LevelDetails = {
            level,
            points,
            pointsToNextLevel,
            icon,
        };

        return levelDetails;
    }

    public static async emitLevelDetailsUpdated(context: Context) {
        const levelDetails = await this.getDetails(context, context.userId);
        if (!levelDetails) {
            console.error('Failed to get level details');
            return;
        }

        WebSocketService.emitLevelDetailsUpdated(context, levelDetails);
    }

    private static async getPointsToNextLevel(level: number, points: number) {
        const nextPointTier = await PointTierService.getByLevel(level + 1);
        if (!nextPointTier) {
            console.error('Failed to get next point tier');
            return 0;
        }

        const minPoints = nextPointTier.minPoints ?? 0;
        return minPoints - points;
    }

    private static async getLevelIcon(level: number) {
        const pointTier = await PointTierService.getByLevel(level);
        const icon: Icon = pointTier?.badge?.icon ?? {
            localImage: 'GENERAL.POINTS',
        };

        return icon;
    }
}
