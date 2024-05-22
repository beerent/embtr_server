import { PlannedDayResult } from '../../schema';
import { Constants } from '../constants/constants';
import { PureDate } from '../date/PureDate';

export interface PlannedDayCompletionStatus {
    dayKey: string;
    date: PureDate;
    status: Constants.CompletionState;
}

export interface PlannedDayAttribute {
    body: string;
    icon?: {
        remoteImageUrl?: string;
        localImage?: string;
    };
    ionicon?: {
        name: string;
        color: string;
    };
}

export interface PlannedDayResultDto extends PlannedDayResult {
    attribute?: PlannedDayAttribute;
}
