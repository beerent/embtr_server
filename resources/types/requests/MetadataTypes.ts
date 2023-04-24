import { Metadata } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetAllMetadataResonse extends Response {
  metadata: Metadata[];
}
