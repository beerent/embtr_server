import { Request } from 'express';
import {
    GetTimelineResponse,
    TimelineData,
    TimelineElement,
    TimelineElementType,
    TimelineRequestCursor,
} from '@resources/types/requests/Timeline';
import { UserPostService } from '@src/service/UserPostService';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import { SUCCESS } from '@src/common/RequestResponses';
import { PlannedDayResult, UserPost } from '@resources/schema';
import { TimelineDao } from '@src/database/custom/TimelineDao';
import { Context } from '@src/general/auth/Context';
import request from 'supertest';

export class TimelineService {
    public static async get(
        context: Context,
        cursor?: Date,
        limit?: number
    ): Promise<TimelineData> {
        const timelineRequestCursor: TimelineRequestCursor = TimelineService.getCursor(
            cursor,
            limit
        );
        const queryData = await TimelineDao.getByDateAndLimit(
            timelineRequestCursor.cursor,
            timelineRequestCursor.limit
        );

        const [userPosts, plannedDayResults] = await Promise.all([
            UserPostService.getAllByIds(context, queryData.userPostIds),
            PlannedDayResultService.getAllByIds(context, queryData.plannedDayResultIds),
        ]);

        const elements: TimelineElement[] = [
            ...TimelineService.createUserPostTimelineElements(userPosts ?? []),
            ...TimelineService.createPlannedDayResultTimelineElements(plannedDayResults ?? []),
        ];
        elements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        let nextCursor: TimelineRequestCursor | undefined = undefined;
        if (elements.length > 0) {
            nextCursor = {
                cursor: elements[elements.length - 1].createdAt,
                limit: timelineRequestCursor.limit,
            };
        }

        const timelineData: TimelineData = {
            elements,
            nextCursor,
        };

        return timelineData;
    }

    private static createUserPostTimelineElements(userPosts: UserPost[]): TimelineElement[] {
        const elements: TimelineElement[] = [];

        for (const userPost of userPosts) {
            elements.push({
                type: TimelineElementType.USER_POST,
                createdAt: userPost.createdAt ?? new Date(),
                userPost,
            });
        }

        return elements;
    }

    private static createPlannedDayResultTimelineElements(
        plannedDayResults: PlannedDayResult[]
    ): TimelineElement[] {
        const elements: TimelineElement[] = [];

        for (const plannedDayResult of plannedDayResults) {
            elements.push({
                type: TimelineElementType.PLANNED_DAY_RESULT,
                createdAt: plannedDayResult.createdAt ?? new Date(),
                plannedDayResult,
            });
        }

        return elements;
    }

    private static getCursor(
        requestedCursor?: Date,
        requestedLimit?: number
    ): TimelineRequestCursor {
        let cursor = new Date();
        let limit = 15;

        if (requestedCursor) {
            cursor = requestedCursor;
        }

        if (requestedLimit) {
            limit = requestedLimit;
        }

        return { cursor, limit };
    }
}
