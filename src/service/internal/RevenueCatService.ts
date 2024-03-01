import { EnvironmentOption } from '@src/utility/environment/EnvironmentUtility';

export class RevenueCatService {
    public static async isPremium(uid: string): Promise<boolean> {
        const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${uid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization:
                    'Bearer ' + EnvironmentOption.get(EnvironmentOption.REVENUE_CAT_API_KEY),
            },
        });

        if (response.status !== 200) {
            console.error('Failed to fetch premium status from revenuecat');
            return false;
        }

        try {
            const json = await response.json();
            const expiresDate = new Date(
                json.subscriber.entitlements['Embtr Premium'].expires_date
            );
            return expiresDate > new Date();
        } catch (error) {
            console.error('Failed to parse premium status from revenuecat', error);
            return false;
        }
    }
}
