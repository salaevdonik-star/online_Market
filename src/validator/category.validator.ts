import joi from "joi";

export default function categoryValidator(data: any) {
  const schema = joi.object({
    name: joi.string().min(2).max(50).required(),
  });

  return schema.validate(data);
}
