require('dotenv').config();

export enum EnvironmentOption {
    DATABASE_URL = 'DATABASE_URL',
    FIREBASE_WEB_API_KEY = 'FIREBASE_WEB_API_KEY',
    SERVICE_CREDENTIALS_FILE_PATH = 'SERVICE_CREDENTIALS_FILE_PATH',
    API_ALERTS_API_KEY = 'API_ALERTS_API_KEY',
}

export namespace EnvironmentOption {
    export function get(option: EnvironmentOption): string {
        const value = process.env[option];

        if (!value) {
            throw new Error(`Environment variable ${option} is not set`);
        }

        return value;
    }
}
