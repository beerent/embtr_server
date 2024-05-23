import { Icon } from '../../schema';
import { Response } from './RequestTypes';

export interface GetIconsResponse extends Response {
  icons: Icon[];
}

export interface CreateIconRequest {
  icon: Icon;
  tags?: string[];
  categories?: string[];
}

export interface CreateIconResponse extends Response {
  icon?: Icon;
}
