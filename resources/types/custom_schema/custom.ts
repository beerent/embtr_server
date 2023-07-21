export interface ChallengeCompletionData {
  amountComplete: number;
  amountRequired: number;
  percentComplete: number;
  challengeRequirementCompletionState: ChallengeRequirementCompletionState;
}

export interface JoinedChallenge {
  challenge: Challenge;
  participants: ChallengeParticipant[];
}
