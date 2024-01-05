import { Code } from '@resources/codes';
import { Response } from '@resources/types/requests/RequestTypes';

export class ServiceException extends Error {
    httpCode: number;
    internalCode: Code;

    constructor(httpCode: number, internalCode: Code, message: string) {
        super(message);
        this.httpCode = httpCode;
        this.internalCode = internalCode;

        // Set the prototype explicitly, as necessary for ES6 class extensions of built-in classes
        Object.setPrototypeOf(this, ServiceException.prototype);
    }

    public static getResponse(error: unknown): Response {
        if (error instanceof ServiceException) {
            return {
                httpCode: error.httpCode,
                internalCode: error.internalCode,
                message: error.message,
                success: false,
            };
        }

        return {
            httpCode: 500,
            internalCode: Code.INTERNAL_ERROR,
            message: 'internal server error',
            success: false,
        };
    }
}
