import { Icon } from '../../schema';
import { Response } from './RequestTypes';

export interface GetIconResponse extends Response {
    icon?: Icon;
}

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

export interface UpdateIconData {
    name?: string;
    tags?: string[];
    categories?: string[];
    remoteImageUrl?: string;
    localImage?: string;
}

export interface UpdateIconRequest {
    id: number;
    data: UpdateIconData;
}

export interface UpdateIconResponse extends Response {
    icon?: Icon;
}

export interface DeleteIconRequest {
    id: number;
}
