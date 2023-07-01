export interface ChallengeCompletionData {
  amountComplete: number;
  amountRequired: number;
  percentComplete: number;
}

export interface ChallengeRequirementCustom {
  custom: {
    completionData: ChallengeCompletionData;
  };
}

export interface ChallengeCustom {
  custom: {
    brentWasHere: boolean;
  };
}

export interface ImageCustom {
  thedevdadssecretvalue: number;
}
