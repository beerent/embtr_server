import { PointDefinition } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { PointDefinitionDao } from '@src/database/PointDefinitionDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PointDefinitionService {
    public static async getAll(context: Context) {
        const pointDefinitions = await PointDefinitionDao.getAll();
        const pointDefinitionModels: PointDefinition[] =
            ModelConverter.convertAll(pointDefinitions);

        return pointDefinitionModels;
    }

    public static async getAllLatestVersions(context: Context) {
        const latestPointDefinitions = await PointDefinitionDao.getAllLatestVersions();
        const latestPointDefinitionModels: PointDefinition[] =
            ModelConverter.convertAll(latestPointDefinitions);

        return latestPointDefinitionModels;
    }

    public static async getLatestVersion(context: Context, type: Constants.PointDefinitionType) {
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
