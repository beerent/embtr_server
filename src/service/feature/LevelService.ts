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

        const pointTier = await PointTierService.getByLevel(level);
        if (pointTier?.minPoints === undefined || pointTier?.maxPoints === undefined) {
            return undefined;
        }

        const levelDetails: LevelDetails = {
            level: pointTier,
            points,
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
}
