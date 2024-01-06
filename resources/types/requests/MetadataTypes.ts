import { Metadata } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetAllMetadataResponse extends Response {
  metadata: Metadata[];
}
