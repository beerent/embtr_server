import { Badge } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetAllBadgesResponse extends Response {
    badges: Badge[]
}
