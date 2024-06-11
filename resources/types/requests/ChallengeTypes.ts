import {
  ChallengeSummary,
  ChallengeDetails,
  ChallengeRecentlyJoined,
  ChallengeFull,
} from '../dto/Challenge';
import { Challenge, ChallengeParticipant } from '../../schema';
import { Response } from './RequestTypes';
import { PureDate } from '../date/PureDate';

/**
 * Challenges
 */
export interface GetChallengesResponse extends Response {
  challenges: Challenge[];
}

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

export interface LeaveChallengeRequest {
  date: PureDate;
}

export interface CreateChallengeFullRequest {
  challengeFull: ChallengeFull;
}

export interface UpdateChallengeFullRequest {
  challengeFull: ChallengeFull;
}

export interface GetChallengeFullResponse extends Response {
  challengeFull?: ChallengeFull;
}

export interface CreateChallengeResponse extends Response {
  challenge?: Challenge;
}

export interface UpdateChallengeResponse extends Response {
  challengeFull?: ChallengeFull;
}
