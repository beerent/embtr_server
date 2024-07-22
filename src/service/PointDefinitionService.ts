import { PointDefinition } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { PointDefinitionDao } from '@src/database/PointDefinitionDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PointDefinitionService {
    public static async getLatestVersion(type: Constants.PointDefinitionType) {
        if (type === Constants.PointDefinitionType.INVALID) {
            return undefined;
        }

        const latestPointDefinition = await PointDefinitionDao.getLatestVersion(type);
        if (!latestPointDefinition) {
            return undefined;
        }

        const latestPointDefinitionModel: PointDefinition =
            ModelConverter.convert(latestPointDefinition);
        return latestPointDefinitionModel;
    }
}
