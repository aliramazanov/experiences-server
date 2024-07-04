class ApplicationError extends Error {
  statusCode: number | string;
  status: string;
  isOperational: boolean;
  constructor(message: string, statusCode: string | number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApplicationError;
