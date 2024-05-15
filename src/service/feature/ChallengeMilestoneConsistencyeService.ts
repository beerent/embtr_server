import {
    PlannedDayChallengeMilestone,
    ChallengeParticipant,
    ChallengeMilestone,
} from '@resources/schema';
import { Context } from '@src/general/auth/Context';
import { ChallengeUtility } from '@src/utility/ChallengeUtility';
import { ChallengeParticipantService } from '../ChallengeParticipantService';
import { PlannedDayChallengeMilestoneService } from '../PlannedDayChallengeMilestoneService';

export class ChallengeMilestoneConsistencyService {
    public static async consistChallengeMilestones(
        context: Context,
        plannedDayId: number,
        challengeParticipantId: number
    ) {
        // get participant
        const challengeParticipant = await ChallengeParticipantService.get(
            context,
            challengeParticipantId
        );

        if (!challengeParticipant) {
            throw new Error('Challenge participant not found');
        }

        const percentComplete = this.getPercentComplete(challengeParticipant);

        const allChallengeMilestones = challengeParticipant.challenge?.challengeMilestones ?? [];
        const initialAchievedPlannedDayChallengeMilestones =
            challengeParticipant?.plannedDayChallengeMilestones ?? [];

        const unachievedPlannedDayChallengeMilestones =
            this.getUnachievedPlannedDayChallengeMilestones(
                initialAchievedPlannedDayChallengeMilestones,
                percentComplete
            );
        if (unachievedPlannedDayChallengeMilestones.length > 0) {
            console.log(
                'unachievedPlannedDayChallengeMilestones',
                unachievedPlannedDayChallengeMilestones.map(
                    (m) => m.challengeMilestone?.milestone?.key
                )
            );
        }

        await this.deleteUnachievedPlannedDayChallengeMilestones(
            context,
            unachievedPlannedDayChallengeMilestones
        );

        const remainingAchievedPlannedDayChallengeMilestones =
            this.getRemainingAchievedPlannedDayChallengeMilestones(
                initialAchievedPlannedDayChallengeMilestones,
                unachievedPlannedDayChallengeMilestones
            );

        const possiblePlannedDayChallengeMilestones = this.getPossiblePlannedDayChallengeMilestones(
            allChallengeMilestones,
            remainingAchievedPlannedDayChallengeMilestones
        );

        const achievedPlannedDayChallengeMilestones = this.getAchivedPlannedDayChallengeMilestones(
            possiblePlannedDayChallengeMilestones,
            percentComplete
        );

        if (achievedPlannedDayChallengeMilestones.length > 0) {
            console.log(
                'achievedPlannedDayChallengeMilestones',
                achievedPlannedDayChallengeMilestones.map((m) => m.milestone?.key)
            );
        }

        this.createAchievedPlannedDayChallengeMilestones(
            context,
            plannedDayId,
            challengeParticipantId,
            achievedPlannedDayChallengeMilestones
        );
    }

    private static async deleteUnachievedPlannedDayChallengeMilestones(
        context: Context,
        plannedDayChallengeMilestonesToDelete: PlannedDayChallengeMilestone[]
    ) {
        const ids = plannedDayChallengeMilestonesToDelete.map(
            (plannedDayChallengeMilestone) => plannedDayChallengeMilestone.id ?? 0
        );

        await PlannedDayChallengeMilestoneService.deleteAll(context, ids);
    }

    private static async createAchievedPlannedDayChallengeMilestones(
        context: Context,
        plannedDayId: number,
        challengeParticipantId: number,
        achievedPlannedDayChallengeMilestones: ChallengeMilestone[]
    ) {
        for (const challengeMilestone of achievedPlannedDayChallengeMilestones) {
            if (!challengeMilestone.id) {
                throw new Error('invalid challenge milestone or challenge participant id');
            }

            PlannedDayChallengeMilestoneService.create(
                context,
                plannedDayId,
                challengeMilestone.id,
                challengeParticipantId
            );
        }
    }

    private static getRemainingAchievedPlannedDayChallengeMilestones(
        currentPlannedDayChallengeMilestones: PlannedDayChallengeMilestone[],
        noLongerAchievedPlannedDayChallengeMilestones: PlannedDayChallengeMilestone[]
    ) {
        const achievedMilestones = currentPlannedDayChallengeMilestones.filter(
            (plannedDayChallengeMilestone) =>
                !noLongerAchievedPlannedDayChallengeMilestones.some(
                    (noLongerAchievedPlannedDayChallengeMilestone) =>
                        plannedDayChallengeMilestone.id ===
                        noLongerAchievedPlannedDayChallengeMilestone.id
                )
        );

        return achievedMilestones;
    }

    private static getUnachievedPlannedDayChallengeMilestones(
        currentPlannedDayChallengeMilestones: PlannedDayChallengeMilestone[],
        percent: number
    ) {
        const plannedDayChallengeMilestonesToDelete = currentPlannedDayChallengeMilestones.filter(
            (plannedDayChallengeMilestone) =>
                (plannedDayChallengeMilestone.challengeMilestone?.milestone?.metric ?? 0) >= percent
        );

        return plannedDayChallengeMilestonesToDelete;
    }

    private static getPossiblePlannedDayChallengeMilestones(
        allChallengeMilestones: ChallengeMilestone[],
        currentPlannedDayChallengeMilestones: PlannedDayChallengeMilestone[]
    ) {
        const remainingChallengeMilestones = allChallengeMilestones.filter(
            (challengeMilestone) =>
                !currentPlannedDayChallengeMilestones.some(
                    (currentPlannedDayMilestone) =>
                        currentPlannedDayMilestone.challengeMilestoneId === challengeMilestone.id
                )
        );

        return remainingChallengeMilestones;
    }

    private static getAchivedPlannedDayChallengeMilestones(
        challengeMilestones: ChallengeMilestone[],
        percent: number
    ) {
        const achievedPlannedDayChallengeMilestones: ChallengeMilestone[] = [];
        // create milestones that have been achieved
        for (const challengeMilestone of challengeMilestones) {
            if (!challengeMilestone.milestone?.metric || !challengeMilestone.id) {
                throw new Error('Milestone data is required');
            }

            if (percent >= challengeMilestone.milestone.metric) {
                achievedPlannedDayChallengeMilestones.push(challengeMilestone);
            }
        }

        return achievedPlannedDayChallengeMilestones;
    }

    private static getPercentComplete(challengeParticipant: ChallengeParticipant) {
        const amountComplete = challengeParticipant?.amountComplete ?? 0;
        const amountRequired = ChallengeUtility.getRequirementRequiredAmount(
            challengeParticipant?.challenge
        );

        const percentComplete = Math.round((amountComplete / amountRequired) * 100);
        return percentComplete;
    }
}
