import {
    TimelineData,
    TimelineElement,
    TimelineElementType,
    TimelineRequestCursor,
} from '@resources/types/requests/Timeline';
import { UserPostService } from '@src/service/UserPostService';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import { PlannedDayResult, UserPost } from '@resources/schema';
import { TimelineDao } from '@src/database/custom/TimelineDao';
import { Context } from '@src/general/auth/Context';
import { BlockUserService } from '@src/service/BlockUserService';
import { ChallengeService } from './ChallengeService';
import { ChallengeRecentlyJoined } from '@resources/types/dto/Challenge';

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

        const joinedBlockedUserIds = await BlockUserService.getBlockedAndBlockedByUserIds(context);

        const queryData = await TimelineDao.getByDateAndLimit(
            timelineRequestCursor.cursor,
            timelineRequestCursor.limit
        );

        let [userPosts, plannedDayResults, challengeSummaries] = await Promise.all([
            UserPostService.getAllByIds(context, queryData.userPostIds),
            PlannedDayResultService.getAllByIds(context, queryData.plannedDayResultIds),
            ChallengeService.getChallengeSummariesByIds(context, queryData.challengeIds),
        ]);

        userPosts = userPosts.filter(
            (userPost) => !joinedBlockedUserIds.includes(userPost.userId ?? -1)
        );
        plannedDayResults = plannedDayResults.filter(
            (plannedDayResult) =>
                !joinedBlockedUserIds.includes(plannedDayResult.plannedDay?.userId ?? -1)
        );

        const elements: TimelineElement[] = [
            ...TimelineService.createUserPostTimelineElements(userPosts ?? []),
            ...TimelineService.createPlannedDayResultTimelineElements(plannedDayResults ?? []),
            ...TimelineService.createRecentlyJoinedChallengeTimelineElements(
                challengeSummaries ?? []
            ),
        ];
        elements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const timelineData = this.postProcessData(elements, timelineRequestCursor.limit);
        return timelineData;
    }

    public static async getUserPostsForUser(
        context: Context,
        userId: number,
        cursor?: Date,
        limit?: number
    ): Promise<TimelineData> {
        const timelineRequestCursor: TimelineRequestCursor = TimelineService.getCursor(
            cursor,
            limit
        );
        const queryData = await TimelineDao.getUserPostsForUserByDateAndLimit(
            userId,
            timelineRequestCursor.cursor,
            timelineRequestCursor.limit
        );

        const userPosts = await UserPostService.getAllByIds(context, queryData.userPostIds);
        const elements: TimelineElement[] = TimelineService.createUserPostTimelineElements(
            userPosts ?? []
        );

        const timelineData = this.postProcessData(elements, timelineRequestCursor.limit);
        return timelineData;
    }

    public static async getPlannedDayResultForUser(
        context: Context,
        userId: number,
        cursor?: Date,
        limit?: number
    ): Promise<TimelineData> {
        const timelineRequestCursor: TimelineRequestCursor = TimelineService.getCursor(
            cursor,
            limit
        );
        const queryData = await TimelineDao.getPlannedDayResultsForUserByDateAndLimit(
            userId,
            timelineRequestCursor.cursor,
            timelineRequestCursor.limit
        );

        const plannedDayResults = await PlannedDayResultService.getAllByIds(
            context,
            queryData.plannedDayResultIds
        );
        const elements: TimelineElement[] = TimelineService.createPlannedDayResultTimelineElements(
            plannedDayResults ?? []
        );

        const timelineData = this.postProcessData(elements, timelineRequestCursor.limit);
        return timelineData;
    }

    private static postProcessData(elements: TimelineElement[], limit: number) {
        elements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        let nextCursor: TimelineRequestCursor | undefined = undefined;
        if (elements.length > 0) {
            nextCursor = {
                cursor: elements[elements.length - 1].createdAt,
                limit,
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

    private static createRecentlyJoinedChallengeTimelineElements(
        challengesRecentlyJoined: ChallengeRecentlyJoined[]
    ) {
        const elements: TimelineElement[] = [];

        for (const challengeRecentlyJoined of challengesRecentlyJoined) {
            elements.push({
                type: TimelineElementType.RECENTLY_JOINED_CHALLENGE,
                createdAt: challengeRecentlyJoined.timelineTimestamp ?? new Date(),
                challengeRecentlyJoined: challengeRecentlyJoined,
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
