import { ChallengeSummary, ChallengeDetails, ChallengeRecentlyJoined } from '../dto/Challenge';
import {
  Award,
  Challenge,
  ChallengeParticipant,
  ChallengeRequirement,
  Task,
} from '../../schema';
import { Response } from './RequestTypes';
import { PureDate } from '../date/PureDate';

/**
 * Challenges
 */
export interface GetChallengesResponse extends Response {
  challenges: Challenge[]
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

export interface CreateChallengeRequest {
  challenge: Pick<Challenge, 'name' | 'description' | 'start' | 'end'>;
  award: Pick<Award, 'name' | 'description' | 'remoteImageUrl' | 'localImage'>;
  task: Pick<Task, 'title' | 'description'>;
  challengeRequirement: Pick<
    ChallengeRequirement,
    | 'unitId'
    | 'calculationType'
    | 'calculationIntervalDays'
    | 'requiredIntervalQuantity'
    | 'requiredTaskQuantity'
  >;
  milestoneKeys: string[];
}

export interface CreateChallengeResponse extends Response {
  challenge?: Challenge;
}
