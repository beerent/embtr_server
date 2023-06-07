import { Unit} from "../../schema";
import { Response } from "./RequestTypes";

export interface GetUnitsResponse extends Response {
  units?: Unit[]
}
