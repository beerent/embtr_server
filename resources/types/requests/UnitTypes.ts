import { Unit} from "../../schema";
import { Response } from "./RequestTypes";

export interface GetUnitsResponse extends Response {
    units?: Unit[];
}

export interface CreateUnitRequest {
    unit: string;
    abreveation: string;
    stepSize: number;
}

export interface CreateUnitResponse extends Response {
    unit?: Unit;
}
