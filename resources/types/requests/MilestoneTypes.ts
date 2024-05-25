import { Milestone } from '../../schema';
import { Response } from './RequestTypes';

export interface GetMilestonesResponse extends Response {
    milestones: Milestone[];
}

