import { Context } from '@src/general/auth/Context';
import { ApiAlertsService } from './ApiAlertsService';

export class PremiumService {
    public static async premiumPressed(context: Context, source: string) {
        await ApiAlertsService.sendAlert('premium pressed: ' + source);
    }
}
