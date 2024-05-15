import { Challenge, ChallengeCalculationType } from '@resources/schema';

export class ChallengeUtility {
    public static getRequirementRequiredAmount(challenge?: Challenge): number {
        if (!challenge) {
            return 0;
        }

        if (!challenge.challengeRequirements) {
            return 0;
        }

        const requirement = challenge.challengeRequirements[0];
        const reqiredAmount =
            requirement.calculationType === ChallengeCalculationType.TOTAL
                ? requirement.requiredTaskQuantity
                : requirement.requiredIntervalQuantity;

        return reqiredAmount ?? 0;
    }
}
