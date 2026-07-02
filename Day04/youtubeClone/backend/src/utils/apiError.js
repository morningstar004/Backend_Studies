class apiError extends Error {
  constructor(
    message = "Some error occurred",
    statusCode,
    error = [],
    statck = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.error = error;
    this.stack = stack;
    this.success = false;

    if (statck) {
      this.stack = statck;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { apiError };
