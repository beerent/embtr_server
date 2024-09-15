import { ChallengeFull } from '@resources/types/dto/Challenge';

export class ChallengeCondenser {
    public static condenseChallengeFull(challengeFull: ChallengeFull): ChallengeFull {
        const condensedChallengeFull: ChallengeFull = {
            challenge: {
                name: challengeFull.challenge.name,
                description: challengeFull.challenge.description,
                start: challengeFull.challenge.start,
                end: challengeFull.challenge.end,
            },
            award: {
                name: challengeFull.award.name,
                description: challengeFull.award.description,
                iconId: challengeFull.award.iconId,
            },
            task: {
                title: challengeFull.task.title,
                description: challengeFull.task.description,
                iconId: challengeFull.task.iconId,
            },
            challengeRequirement: {
                unitId: challengeFull.challengeRequirement.unitId,
                calculationType: challengeFull.challengeRequirement.calculationType,
                calculationIntervalDays: challengeFull.challengeRequirement.calculationIntervalDays,
                requiredIntervalQuantity:
                    challengeFull.challengeRequirement.requiredIntervalQuantity,
                requiredTaskQuantity: challengeFull.challengeRequirement.requiredTaskQuantity,
            },
            milestoneKeys: challengeFull.milestoneKeys,
            tag: {
                name: challengeFull.tag.name,
                id: challengeFull.tag.id,
            },
        };

        return condensedChallengeFull;
    }
}
