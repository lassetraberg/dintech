const Joi = require("@hapi/joi");

const stateSchemas = {
  state: Joi.object({
    offset: Joi.number().required(),
    isPlaying: Joi.boolean().required()
  }),

  sessionInfo: Joi.object({
    usernames: Joi.array().required(),
    totalClients: Joi.number().required(),
    admin: Joi.string().required(),
    ytUrl: Joi.string().required()
  })
};

module.exports = stateSchemas;
