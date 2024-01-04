import { Metadata } from '@resources/schema';
import { GetAllMetadataResonse } from '@resources/types/requests/MetadataTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { MetadataDao } from '@src/database/MetadataDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class MetadataService {
    public static async getAll(): Promise<GetAllMetadataResonse> {
        const allMetadata = await MetadataDao.getAll();
        const metadataModels: Metadata[] = ModelConverter.convertAll(allMetadata);

        return { ...SUCCESS, metadata: metadataModels };
    }
}
