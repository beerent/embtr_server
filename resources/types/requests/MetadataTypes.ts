import { Metadata } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetAllMetadataResponse extends Response {
  metadata: Metadata[];
}

export interface CreateMetadataRequest {
  key: string;
  value: string;
}

export interface CreateMetadataResponse extends Response {
  metadata: Metadata;
}

export interface MetadataBody {
  key?: string;
  value: string;
}

export interface UpdateMetadataRequest {
  id: string;
  data: MetadataBody
}

export interface UpdateMetadataResponse extends Response {
  metadata: Metadata;
}
