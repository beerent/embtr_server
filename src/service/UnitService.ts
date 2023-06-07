import { SUCCESS } from '@src/common/RequestResponses';
import { GetUnitsResponse } from '@resources/types/requests/UnitTypes';
import { UnitController } from '@src/controller/UnitController';

export class UnitService {
    public static async getAll(): Promise<GetUnitsResponse> {
        const units = await UnitController.getAll();
        return { ...SUCCESS, units };
    }
}
