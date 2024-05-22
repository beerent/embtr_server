import { Icon } from '../../schema';
import { Response } from './RequestTypes';

export interface GetIconsResponse extends Response {
  icons: Icon[];
}
