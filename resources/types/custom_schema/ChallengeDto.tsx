import { ChallengeRequirement } from "../../schema";


export interface ChallengeCompletionData {
  amountComplete: number;
  amountRequired: number;
  percentComplete: number;
}

export interface ChallengeRequirementDto extends ChallengeRequirement {
  custom: {
    completionData: ChallengeCompletionData;
  };
}
