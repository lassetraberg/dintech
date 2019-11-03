const Joi = require("@hapi/joi");

const restSchemas = {
  createSession: Joi.object({
    ytUrl: Joi.string().required(),
    username: Joi.string().required()
  })
};

module.exports = restSchemas;
