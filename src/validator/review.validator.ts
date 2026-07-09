import joi from "joi";

export default function reviewValidator(data: any) {
  const schema = joi.object({
    rating: joi.number().min(1).max(5).required(),
    comment: joi.string().allow(""),
  });

  return schema.validate(data);
}
