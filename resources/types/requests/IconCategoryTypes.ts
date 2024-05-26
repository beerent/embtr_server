import { IconCategory } from '../../schema';
import { Response } from './RequestTypes';

export interface GetIconCategoriesResponse extends Response {
  iconCategories: IconCategory[];
}

