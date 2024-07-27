import { Constants } from '@resources/types/constants/constants';
import { DataDrivenDetail, DataDrivenDetails } from '@resources/types/dto/DataDrivenDetails';
import { Context } from '@src/general/auth/Context';
import { MetadataService } from '../MetadataService';
import { PointDefinitionService } from '../PointDefinitionService';

export class DataDrivenDetailService {
    public static async get(context: Context): Promise<DataDrivenDetails> {
        const version = await MetadataService.getDataDrivenDetailsVersion(context);

        const details: DataDrivenDetail[] = [];
        const [dataDrivenDetail] = await Promise.all([this.getPointsDetail(context)]);
        details.push(dataDrivenDetail);

        const dataDrivenDetails: DataDrivenDetails = {
            version: version,
            details: details,
        };

        return dataDrivenDetails;
    }

    private static async getPointsDetail(context: Context): Promise<DataDrivenDetail> {
        const pointDefinitions = await PointDefinitionService.getAllLatestVersions(context);

        const pointsDetail = pointDefinitions
            .filter(({ type, points }) => type && points)
            .map(({ type, points }) => ({
                type: Constants.getPointDefinition(type ?? ''),
                points: points ?? 0,
            }));

        const dataDrivenDetail: DataDrivenDetail = {
            type: Constants.DataDrivenDetailType.POINTS,
            pointsDetail: pointsDetail,
        };

        return dataDrivenDetail;
    }
}
