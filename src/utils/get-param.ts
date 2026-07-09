import CustomErrorHandler from "../error/error";

/**
 * Express 5 types req.params values as `string | string[]`.
 * This helper safely extracts a single string value and throws
 * a clean 400 error if the param is missing or an array.
 */
export function getParam(value: string | string[] | undefined, name = "param"): string {
  if (!value || Array.isArray(value)) {
    throw CustomErrorHandler.BadRequest(`${name} is required`);
  }
  return value;
}
