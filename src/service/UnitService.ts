import { SUCCESS } from '@src/common/RequestResponses';
import { GetUnitsResponse } from '@resources/types/requests/UnitTypes';
import { UnitController } from '@src/controller/UnitController';
import { Unit } from '@resources/schema';

export class UnitService {
    public static async getAll(): Promise<GetUnitsResponse> {
        const units = await UnitController.getAll();
        return { ...SUCCESS, units };
    }

    public static getUnitString(unit: Unit, quantity: number): string {
        if (!unit.unit) {
            return '';
        }

        const unitString = unit.unit;
        const unitStringCapitalized =
            unitString.charAt(0).toUpperCase() + unitString.slice(1).toLowerCase();
        if (quantity === 1) {
            return unitStringCapitalized;
        }

        return `${unitStringCapitalized}s`;
    }
}
