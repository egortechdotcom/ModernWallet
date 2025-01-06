const Joi = require('joi');

function validateSignUpDetails(user) {
  const message = 'Password must be of atleast 8 characters. '
  + 'It should have One UpperCase,One LowerCase,One Number and One SpecialCase Character';
  const schema = Joi.object({
    username: Joi.string().max(50).min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,30}$/)
      .message(message),
    confirm_password: Joi.any().valid(Joi.ref('password')).required(),
  });
  const result = schema.validate(user);
  return result;
}

module.exports = {
  validateSignUpDetails,
};
