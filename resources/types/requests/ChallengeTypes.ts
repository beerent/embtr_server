import { ChallengeSummary, ChallengeDetails, ChallengeRecentlyJoined } from "../dto/Challenge";
import { ChallengeParticipant } from "../../schema";
import { Response } from "./RequestTypes";

/**
  * Challenge Summaries
*/
export interface GetChallengesSummariesResponse extends Response {
  challengesSummaries?: ChallengeSummary[];
}

export interface GetChallengeSummaryResponse extends Response {
  challengeSummary?: ChallengeSummary;
}

/**
  * Challenge Details
*/
export interface GetChallengesDetailsResponse extends Response {
  challengesDetails?: ChallengeDetails[];
}

export interface GetChallengeDetailsResponse extends Response {
  challengeDetails?: ChallengeDetails;
}


/**
  * Challenge Recently Joined
*/
export interface GetChallengesRecentlyJoinedResponse extends Response {
  challengesRecentlyJoined?: ChallengeRecentlyJoined[];
}

/**
  * Challenge Details
*/
export interface GetChallengeParticipantsResponse extends Response {
  challengeParticipants?: ChallengeParticipant[];
}

export interface GetChallengeParticipationResponse extends Response {
  challengeParticipation?: ChallengeParticipant[];
}

export interface RegisterChallengeRequest {
  challengeId: number;
}
