import { PointTier } from '@resources/schema';
import { PointTierDao } from '@src/database/PointTierDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PointTierService {
    public static async getByPoints(points: number) {
        const pointTier = await PointTierDao.getByPoints(points);
        if (!pointTier) {
            return undefined;
        }

        const pointTierModel: PointTier = ModelConverter.convert(pointTier);
        return pointTierModel;
    }

    public static async getByLevel(level: number) {
        const pointTier = await PointTierDao.getByLevel(level);
        if (!pointTier) {
            return undefined;
        }

        const pointTierModel: PointTier = ModelConverter.convert(pointTier);
        return pointTierModel;
    }
}
