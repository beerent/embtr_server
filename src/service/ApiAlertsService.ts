import { EnvironmentOption } from '@src/utility/environment/EnvironmentUtility';

EnvironmentOption.get(EnvironmentOption.API_ALERTS_API_KEY);

export class ApiAlertsService {
    public static async sendAlert(string: string) {
        fetch('https://api.apialerts.com/event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization:
                    'Bearer ' + EnvironmentOption.get(EnvironmentOption.API_ALERTS_API_KEY),
            },
            body: JSON.stringify({
                message: string,
            }),
        });
    }
}
