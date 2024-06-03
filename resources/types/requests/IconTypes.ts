import { Icon, IconCategory, Tag } from '../../schema';
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

export interface UpdateIconRequest {
    id: number
    data: {
      name?: string
      tags?: Tag[]
      categories?: IconCategory[]
      remoteImageUrl?: string
    }
}

export interface UpdateIconResponse extends Response {
    icon?: Icon;
}

export interface DeleteIconRequest {
    id: number
}
