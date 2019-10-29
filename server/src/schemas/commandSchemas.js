const Joi = require("@hapi/joi");

const commandSchemas = {
  play: Joi.object({
    command: Joi.string()
      .pattern(/play/)
      .required()
  }),

  pause: Joi.object({
    command: Joi.string()
      .pattern(/pause/)
      .required(),

    offset: Joi.number().required()
  }),

  seekTo: Joi.object({
    command: Joi.string()
      .pattern(/seekTo/)
      .required(),

    offset: Joi.number().required()
  }),

  requestState: Joi.object({
    command: Joi.string()
      .pattern(/requestState/)
      .required()
  })
};

module.exports = commandSchemas;
