const Joi = require("@hapi/joi");
const stateSchemas = require("./stateSchemas");

const commandSchemas = {
  play: Joi.object({
    command: Joi.string()
      .pattern(/play/)
      .required(),

  }),

  pause: Joi.object({
    command: Joi.string()
      .pattern(/pause/)
      .required(),

    offset: Joi.number().required(),

  }),

  seekTo: Joi.object({
    command: Joi.string()
      .pattern(/seekTo/)
      .required(),

    offset: Joi.number().required(),

  }),

  requestState: Joi.object({
    command: Joi.string()
      .pattern(/requestState/)
      .required()
  }),

  setState: Joi.object({
    command: Joi.string()
      .pattern(/setState/)
      .required(),

    state: stateSchemas.state
  }),

  ignoredByAdmin: ["setState"]
};

module.exports = commandSchemas;
