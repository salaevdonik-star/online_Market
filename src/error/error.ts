export default class CustomErrorHandler extends Error {
  status: number;
  errors: any[];

  constructor(status: number, message: string, errors: any[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message: string, errors: any[] = []) {
    return new CustomErrorHandler(400, message, errors);
  }

  static UnAuthorized(message: string, errors: any[] = []) {
    return new CustomErrorHandler(401, message, errors);
  }

  static Forbidden(message: string, errors: any[] = []) {
    return new CustomErrorHandler(403, message, errors);
  }

  static NotFound(message: string, errors: any[] = []) {
    return new CustomErrorHandler(404, message, errors);
  }
}
