import { FeaturedPost } from '../../schema';
import { Response } from './RequestTypes';

export interface GetFeaturedPostResponse extends Response {
  featuredPost?: FeaturedPost;
}
