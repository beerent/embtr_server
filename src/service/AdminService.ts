import { Response } from "@resources/types/requests/RequestTypes";
import { SUCCESS } from "@src/common/RequestResponses";
import { MetadataController } from "@src/controller/MetadataController";

export class AdminService {
    public static async ping(): Promise<Response> {
        return { ...SUCCESS };
    }

    public static async databasePing(): Promise<Response> {
        await MetadataController.getAll();
        return { ...SUCCESS };
    }
}