import { Request } from 'express';

export namespace ClientVersionUtil {
    export const getClientVersion = (req: Request) => {
        const clientVersion = req.header('client-version');
        if (!clientVersion) {
            return undefined;
        }

        return clientVersion;
    };

    export const getMajorClientVersion = (req: Request) => {
        const clientVersion = getClientVersion(req);
        if (!clientVersion) {
            return undefined;
        }

        const majorVersion = clientVersion.split('.')[0];
        return Number(majorVersion);
    };
}
