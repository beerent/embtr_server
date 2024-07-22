import { LevelDetails } from '../dto/Level';
import { Response } from './RequestTypes';
import { Level } from '../../schema';

export interface GetLevelDetailsResponse extends Response {
  levelDetails?: LevelDetails;
}

export interface GetLevelsResponse extends Response {
  levels?: Level[];
}
