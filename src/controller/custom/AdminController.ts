import { Response } from "@resources/types/requests/RequestTypes";
import { SUCCESS } from "@src/common/RequestResponses";
import { MetadataController } from "../MetadataController";

export class AdminController {
    public static async ping(): Promise<Response> {
        await MetadataController.getAll();
        return { ...SUCCESS };
    }
}