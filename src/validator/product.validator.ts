import joi from "joi";

export default function productValidator(data: any) {
  const schema = joi.object({
    name: joi.string().min(2).max(150).required(),
    description: joi.string().allow(""),
    price: joi.number().min(0).required(),
    old_price: joi.number().min(0).allow(null),
    discount_pct: joi.number().min(0).max(100).allow(null),
    stock: joi.number().min(0).required(),
    category_id: joi.string().required(),
    colors: joi.alternatives().try(joi.array().items(joi.string()), joi.string()).allow(""),
    sizes: joi.alternatives().try(joi.array().items(joi.string()), joi.string()).allow(""),
    is_new: joi.boolean().allow(""),
    is_flash_sale: joi.boolean().allow(""),
    flash_sale_end: joi.date().allow(null, ""),
  });

  return schema.validate(data);
}
