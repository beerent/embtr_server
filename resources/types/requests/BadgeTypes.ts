import { Badge } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetAllBadgesResponse extends Response {
    badges: Badge[]
}

export interface CreateBadge {
    badge: Badge;
}

export interface CreateBadgeResponse extends Response {
    badge?: Badge;
}

