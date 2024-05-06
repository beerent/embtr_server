import { TimelineData, TimelineElement } from '@resources/types/requests/Timeline';
import { TimelineTypesV3 } from '@src/endpoints/timeline/TimelineRouterV3';
import { ChallengeTransformationServiceV3 } from './ChallengeTransformationService';

export class TimelineTransformationServiceV3 {
    public static transformOutTimelineData(
        timelineData: TimelineData
    ): TimelineTypesV3.TimelineDataV3 {
        const transformedTimelineElements = this.transformOutAllTimelineElements(
            timelineData.elements
        );

        const transformedTimelineData: TimelineTypesV3.TimelineDataV3 = {
            ...timelineData,
            elements: transformedTimelineElements,
        };

        return transformedTimelineData;
    }

    public static transformOutAllTimelineElements(
        timelineElements: TimelineElement[]
    ): TimelineTypesV3.TimelineElementV3[] {
        const transformedTimelineElements: TimelineTypesV3.TimelineElementV3[] =
            timelineElements.map((timelineElement) =>
                this.transformOutTimelineElement(timelineElement)
            );
        return transformedTimelineElements;
    }

    public static transformOutTimelineElement(
        timelineElement: TimelineElement
    ): TimelineTypesV3.TimelineElementV3 {
        if (!timelineElement.challengeRecentlyJoined) {
            return {
                ...timelineElement,
                challengeRecentlyJoined: undefined,
            };
        }

        const transformedChallengeRecentlyJoined =
            ChallengeTransformationServiceV3.transformOutChallengeRecentlyJoined(
                timelineElement.challengeRecentlyJoined
            );

        const transformedTimelineElement: TimelineTypesV3.TimelineElementV3 = {
            ...timelineElement,
            challengeRecentlyJoined: transformedChallengeRecentlyJoined,
        };

        return transformedTimelineElement;
    }
}
