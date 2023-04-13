import { Widget } from "../../schema";
import { Response } from "./RequestTypes";

export interface UpdateWidgetsRequest {
  widgets: Widget[];
}

export interface GetWidgetsResponse extends Response {
  widgets?: Widget[]
}
