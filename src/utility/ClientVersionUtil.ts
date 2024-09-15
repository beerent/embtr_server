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

    export const getMinorClientVersion = (req: Request) => {
        const clientVersion = getClientVersion(req);
        if (!clientVersion) {
            return undefined;
        }

        const minorVersion = clientVersion.split('.')[1];
        return Number(minorVersion);
    };

    export const getPatchClientVersion = (req: Request) => {
        const clientVersion = getClientVersion(req);
        if (!clientVersion) {
            return undefined;
        }

        const patchVersion = clientVersion.split('.')[2];
        return Number(patchVersion);
    };

    export const versionIsEarlierThan = (req: Request, version: string) => {
        const majorClientVersion = getMajorClientVersion(req);
        const minorClientVersion = getMinorClientVersion(req);
        const patchClientVersion = getPatchClientVersion(req);

        const majorVersion = Number(version.split('.')[0]);
        const minorVersion = Number(version.split('.')[1]);
        const patchVersion = Number(version.split('.')[2]);

        if (
            majorClientVersion === undefined ||
            minorClientVersion === undefined ||
            patchClientVersion === undefined
        ) {
            return false;
        }

        if (majorClientVersion < majorVersion) {
            return true;
        }

        if (minorClientVersion < minorVersion) {
            return true;
        }

        if (patchClientVersion < patchVersion) {
            return true;
        }

        return false;
    };
}
