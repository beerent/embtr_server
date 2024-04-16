import { Constants } from '../constants/constants';
import { PureDate } from '../date/PureDate';

export interface PlannedDayCompletionStatus {
    dayKey: string;
    date: PureDate;
    status: Constants.CompletionState;
}
