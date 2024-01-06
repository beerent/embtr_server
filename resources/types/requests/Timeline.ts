import { PlannedDayResult, UserPost } from "../../schema";
import { Response } from "./RequestTypes";

export enum TimelineElementType {
  USER_POST = 'USER_POST',
  PLANNED_DAY_RESULT = 'PLANNED_DAY_RESULT'
}

export interface TimelineRequestCursor {
  cursor: Date;
  limit: number;
}

export interface TimelineElement {
  type: TimelineElementType,
  createdAt: Date,
  userPost?: UserPost,
  plannedDayResult?: PlannedDayResult
}

export interface TimelineData {
  elements: TimelineElement[],
  nextCursor?: TimelineRequestCursor
}

export interface GetTimelineRequest {
  cursor?: TimelineRequestCursor
}

export interface GetTimelineResponse extends Response {
  timelineData?: TimelineData
}
