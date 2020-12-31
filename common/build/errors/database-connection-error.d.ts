import { CustomError } from "./custom-errors";
export declare class DatabaseConnectionError extends CustomError {
    reason: string;
    statusCode: number;
    constructor();
    serializeErrors(): {
        message: string;
    }[];
}
