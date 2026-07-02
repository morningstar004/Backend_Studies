class ResponseHandler {
  constructor(
    statusCode,
    message = "Success",
    data = null,
    error = [],
    stack = "",
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.error = error;
    this.stack = stack;
    this.success = statusCode < 400;
  }
}

export { ResponseHandler };
