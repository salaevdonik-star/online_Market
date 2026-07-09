import joi from "joi";

export const registerValidator = (data: any) => {
  const schema = joi.object({
    first_name: joi.string().min(2).max(50).required(),
    last_name: joi.string().min(2).max(50).allow(""),
    email: joi.string().email().required(),
    phone: joi.string().allow(""),
    password: joi.string().min(6).required(),
  });

  return schema.validate(data);
};

export const loginValidator = (data: any) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  return schema.validate(data);
};
