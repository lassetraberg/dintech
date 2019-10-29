const Joi = require("@hapi/joi");

const errorSchemas = {
  error: Joi.object({
    message: Joi.string().required()
  })
};

module.exports = errorSchemas;
