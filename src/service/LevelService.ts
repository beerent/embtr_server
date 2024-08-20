import { Level, User } from '@resources/schema';
import { LevelDetails } from '@resources/types/dto/Level';
import { LevelDao } from '@src/database/LevelDao';
import { LevelEventDispatcher } from '@src/event/level/LevelEventDispatcher';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { UserPropertyUtility } from '@src/utility/UserPropertyUtility';
import { ContextService } from './ContextService';
import { UserPropertyService } from './UserPropertyService';
import { UserService } from './UserService';
import { WebSocketService } from './WebSocketService';

export class LevelService {
    public static async getAll(context: Context) {
        const levels = await LevelDao.getAll();
        if (!levels) {
            return [];
        }

        const levelModels: Level[] = ModelConverter.convertAll(levels);
        return levelModels;
    }

    public static async getByPoints(points: number) {
        const level = await LevelDao.getByPoints(points);
        if (!level) {
            return undefined;
        }

        const levelModel: Level = ModelConverter.convert(level);
        return levelModel;
    }

    public static async getByLevel(levelVal: number) {
        const level = await LevelDao.getByLevel(levelVal);
        if (!level) {
            return undefined;
        }

        const levelModel: Level = ModelConverter.convert(level);
        return levelModel;
    }

    public static async recalculateLevel(context: Context) {
        const [currentLevel, currentPoints] = await Promise.all([
            UserPropertyService.getLevel(context),
            UserPropertyService.getPoints(context),
        ]);

        const level = await this.getByPoints(currentPoints);
        if (!level?.level || level.level === currentLevel) {
            return;
        }

        console.log(`Setting level to ${level.level}`);
        await UserPropertyService.setLevel(context, level.level);

        const userContext = ContextService.contextToUserContext(context);
        LevelEventDispatcher.onUpdated(userContext);
    }

    public static async getDetails(context: Context, userId: number) {
        const user: User = await UserService.getById(context, userId);
        const currentLevel = UserPropertyUtility.getLevel(user);
        const currentPoints = UserPropertyUtility.getPoints(user);

        const level = await this.getByLevel(currentLevel);
        if (level?.minPoints === undefined || level?.maxPoints === undefined) {
            return undefined;
        }

        const levelDetails: LevelDetails = {
            level: level,
            points: currentPoints,
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
