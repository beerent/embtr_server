import { Tag } from '../../schema';
import { Response } from './RequestTypes';

export interface GetTagsResponse extends Response {
  tags: Tag[];
}

