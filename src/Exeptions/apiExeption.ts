class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(status: number, message: string, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(401, "Unauthorized User");
  }

  static BadRequest(message: string, errors = []) {
    return new ApiError(400, message, errors);
  }

  static ConflictError() {
    return new ApiError(409, "User with that email already exist");
  }
}

export default ApiError;
