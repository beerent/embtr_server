import { LevelDetails } from '../dto/Level';
import { Response } from './RequestTypes';

export interface GetLevelDetailsResponse extends Response {
  levelDetails?: LevelDetails;
}
