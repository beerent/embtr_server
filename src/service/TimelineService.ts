import { Request } from 'express';
import {
    GetTimelineResponse,
    TimelineElement,
    TimelineElementType,
    TimelineRequestCursor,
} from '@resources/types/requests/Timeline';
import { UserPostService } from '@src/service/UserPostService';
import { TimelineController } from '@src/controller/custom/TimelineController';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import { SUCCESS } from '@src/common/RequestResponses';
import { PlannedDayResult, UserPost } from '@resources/schema';

export class TimelineService {
    public static async get(request: Request): Promise<GetTimelineResponse> {
        const cursor: TimelineRequestCursor = TimelineService.getCursor(request);
        const queryData = await TimelineController.getByDateAndLimit(cursor.cursor, cursor.limit);

        const [userPosts, plannedDayResults] = await Promise.all([
            UserPostService.getAllByIds(queryData.userPostIds),
            PlannedDayResultService.getAllByIds(queryData.plannedDayResultIds),
        ]);

        const elements: TimelineElement[] = [
            ...TimelineService.createUserPostTimelineElements(userPosts.userPosts ?? []),
            ...TimelineService.createPlannedDayResultTimelineElements(
                plannedDayResults.plannedDayResults ?? []
            ),
        ];
        elements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const nextCursor: TimelineRequestCursor = {
            cursor: elements[elements.length - 1].createdAt,
            limit: cursor.limit,
        };

        return {
            ...SUCCESS,
            results: elements,
            nextCursor,
        };
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

    private static getCursor(request: Request): TimelineRequestCursor {
        let cursor = new Date();
        let limit = 15;

        if (request.query.cursor) {
            cursor = new Date(request.query.cursor as string);
        }

        if (request.query.limit) {
            limit = parseInt(request.query.limit as string);
        }

        return { cursor, limit };
    }
}
