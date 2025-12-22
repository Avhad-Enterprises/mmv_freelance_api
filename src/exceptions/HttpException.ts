/**
 * HTTP Exception class
 * Supports both string messages and structured error objects
 */
class HttpException extends Error {
  public status: number;
  public message: string;
  public details?: Record<string, any>;

  constructor(status: number, message: string | Record<string, any>) {
    if (typeof message === 'string') {
      super(message);
      this.message = message;
    } else {
      const msg = message.message || 'An error occurred';
      super(msg);
      this.message = msg;
      this.details = message;
    }
    this.status = status;
  }
}

export default HttpException;
