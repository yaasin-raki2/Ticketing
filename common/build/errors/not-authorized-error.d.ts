import { CustomError } from "./custom-errors";
export declare class NotAuthorizedError extends CustomError {
    statusCode: number;
    constructor();
    serializeErrors(): {
        message: string;
    }[];
}
