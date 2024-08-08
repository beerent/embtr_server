import { Feature } from '../../schema';
import { DetailedFeature } from '../dto/Feature';
import { Response } from './RequestTypes';

export interface GetFeaturesResponse extends Response {
    features: Feature[];
}

export interface GetDetailedFeatureResponse extends Response {
    detailedFeatures: DetailedFeature[];
}

export interface GetFeatureResponse extends Response {
    feature?: Feature;
}
