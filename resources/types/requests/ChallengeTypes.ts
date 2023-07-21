import { Challenge, ChallengeParticipant, JoinedChallenge } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetChallengesResponse extends Response {
  challenges?: Challenge[];
}

export interface GetChallengeResponse extends Response {
  challenge?: Challenge;
}

export interface GetJoinedChallengesResponse extends Response {
  joinedChallenges?: JoinedChallenge[];
}

export interface GetChallengeParticipationResponse extends Response {
  challengeParticipation?: ChallengeParticipant[];
}

export interface RegisterChallengeRequest {
  challengeId: number;
}
