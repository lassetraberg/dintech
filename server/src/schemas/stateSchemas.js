const Joi = require("@hapi/joi");

const stateSchemas = {
  state: Joi.object({
    offset: Joi.number().required(),
    isPlaying: Joi.boolean().required()
  })
};

module.exports = stateSchemas;
