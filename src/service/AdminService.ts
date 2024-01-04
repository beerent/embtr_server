import { Response } from "@resources/types/requests/RequestTypes";
import { SUCCESS } from "@src/common/RequestResponses";
import { MetadataDao } from "@src/database/MetadataDao";

export class AdminService {
    public static async ping(): Promise<Response> {
        return { ...SUCCESS };
    }

    public static async databasePing(): Promise<Response> {
        await MetadataDao.getAll();
        return { ...SUCCESS };
    }
}