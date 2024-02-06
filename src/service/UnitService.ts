import { Unit } from '@resources/schema';
import { UnitDao } from '@src/database/UnitDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Context } from '@src/general/auth/Context';

export class UnitService {
    public static async getAll(context: Context): Promise<Unit[]> {
        const units = await UnitDao.getAll();
        const unitModels: Unit[] = ModelConverter.convertAll(units);

        return unitModels;
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
