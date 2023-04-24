import { Metadata } from '@resources/schema';
import { GetAllMetadataResonse } from '@resources/types/requests/MetadataTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { MetadataController } from '@src/controller/MetadataController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class MetadataService {
    public static async getAll(): Promise<GetAllMetadataResonse> {
        const allMetadata = await MetadataController.getAll();
        const metadataModels: Metadata[] = ModelConverter.convertAll(allMetadata);

        return { ...SUCCESS, metadata: metadataModels };
    }
}
