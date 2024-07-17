import { PointDefinition } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { PointDefinitionDao } from '@src/database/PointDefinitionDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PointDefinitionService {
    public static async getLatestVersion(pointDefinition: Constants.PointDefinition) {
        if (pointDefinition === Constants.PointDefinition.INVALID) {
            return undefined;
        }

        const latestPointDefinition = await PointDefinitionDao.getLatestVersion(pointDefinition);
        if (!latestPointDefinition) {
            return undefined;
        }

        const latestPointDefinitionModel: PointDefinition =
            ModelConverter.convert(latestPointDefinition);
        return latestPointDefinitionModel;
    }
}
