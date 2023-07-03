import { Challenge, ChallengeParticipant} from "../../schema";
import { Response } from "./RequestTypes";

export interface GetChallengesResponse extends Response {
  challenges?: Challenge[],
}

export interface GetChallengeResponse extends Response {
  challenge?: Challenge,
}

export interface GetChallengeParticipationResponse extends Response {
  challengeParticipation?: ChallengeParticipant[],
}

export interface RegisterChallengeRequest {
  challengeId: number,
}
