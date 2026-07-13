import joi from "joi";

export default function addressValidator(data: any) {
  const schema = joi.object({
    first_name: joi.string().required(),
    last_name: joi.string().allow(""),
    company: joi.string().allow(""),
    street: joi.string().required(),
    apartment: joi.string().allow(""),
    city: joi.string().required(),
    phone: joi.string().required(),
    email: joi.string().email().allow(""),
    is_default: joi.boolean().allow(""),
  });

  return schema.validate(data);
}

export function addressUpdateValidator(data: any) {
  const schema = joi.object({
    first_name: joi.string(),
    last_name: joi.string().allow(""),
    company: joi.string().allow(""),
    street: joi.string(),
    apartment: joi.string().allow(""),
    city: joi.string(),
    phone: joi.string(),
    email: joi.string().email().allow(""),
    is_default: joi.boolean().allow(""),
  });

  return schema.validate(data);
}
