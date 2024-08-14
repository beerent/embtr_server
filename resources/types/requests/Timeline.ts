import { UserPost, UserFeaturedPost } from '../../schema';
import { ChallengeRecentlyJoined } from '../dto/Challenge';
import { PlannedDayResultDto } from '../dto/PlannedDay';
import { Response } from './RequestTypes';

export enum TimelineElementType {
  USER_POST = 'USER_POST',
  PLANNED_DAY_RESULT = 'PLANNED_DAY_RESULT',
  RECENTLY_JOINED_CHALLENGE = 'RECENTLY_JOINED_CHALLENGE',
  USER_FEATURED_POST = 'USER_FEATURED_POST',
}

export interface TimelineRequestCursor {
  cursor: Date;
  limit: number;
}

export interface TimelineElement {
  type: TimelineElementType;
  createdAt: Date;
  userPost?: UserPost;
  plannedDayResult?: PlannedDayResultDto;
  challengeRecentlyJoined?: ChallengeRecentlyJoined;
  userFeaturedPost?: UserFeaturedPost;
}

export interface TimelineData {
  elements: TimelineElement[];
  nextCursor?: TimelineRequestCursor;
}

export interface GetTimelineRequest {
  cursor?: TimelineRequestCursor;
}

export interface GetTimelineResponse extends Response {
  timelineData?: TimelineData;
}

export interface GetTimelineUserPostsResponse extends Response {
  timelineData?: TimelineData;
}

export interface GetTimelinePlannedDayResultsResponse extends Response {
  timelineData?: TimelineData;
}
