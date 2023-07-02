export interface ChallengeCompletionData {
  amountComplete: number;
  amountRequired: number;
  percentComplete: number;
  challengeCompletionState: ChallengeCompletionState;
}

export interface ChallengeRequirementCustom {
  custom: {
    completionData: ChallengeCompletionData;
  };
}

export enum ChallengeCompletionState {
  ACTIVE,
  COMPLETE,
}
