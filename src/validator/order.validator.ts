import joi from "joi";

export default function orderValidator(data: any) {
  const schema = joi.object({
    first_name: joi.string().required(),
    company_name: joi.string().allow(""),
    street_address: joi.string().required(),
    apartment: joi.string().allow(""),
    town_city: joi.string().required(),
    phone_number: joi.string().required(),
    email: joi.string().email().required(),
    save_info: joi.boolean().allow(""),
    payment_method: joi.string().valid("bank", "cash_on_delivery").required(),
    coupon_code: joi.string().allow(""),
  });

  return schema.validate(data);
}
