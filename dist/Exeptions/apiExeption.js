"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
    static UnauthorizedError() {
        return new ApiError(401, "Unauthorized User");
    }
    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }
    static ConflictError() {
        return new ApiError(409, "User with that email already exist");
    }
}
exports.default = ApiError;
