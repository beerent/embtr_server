import { Response } from './RequestTypes';
import { PointDefinition } from '../../schema';

export interface GetPointDefinitionsResponse extends Response {
  definitions?: PointDefinition[];
}
