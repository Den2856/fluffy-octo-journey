export class ApiError extends Error {
  statusCode: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = status;
    this.details = details;
  }
}
export const ok = <T>(data: T) => ({ success: true, data });
