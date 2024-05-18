import { ChallengeParticipant } from '@resources/schema';
import { ChallengeTransformationServiceV3 } from './ChallengeTransformationService';

// "Autobots, roll out!" - jeroenvanwissen - 2024-05-03

export class ChallengeParticipantTransformationServiceV3 {
    public static transformOutAll(
        challengeParticipants: ChallengeParticipant[]
    ): ChallengeParticipant[] {
        const transformedChallengeParticipants: ChallengeParticipant[] = [];
        for (const challengeParticipant of challengeParticipants) {
            transformedChallengeParticipants.push(this.transformOut(challengeParticipant));
        }

        return transformedChallengeParticipants;
    }

    private static transformOut(challengeParticipant: ChallengeParticipant): ChallengeParticipant {
        if (!challengeParticipant.challenge) {
            return challengeParticipant;
        }

        const transformedChallenge = ChallengeTransformationServiceV3.transformOut(
            challengeParticipant.challenge
        );

        challengeParticipant.challenge = transformedChallenge;

        return challengeParticipant;
    }
}
