// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  // TODO: this is just a placeholder. To get something working, return an empty array...
  logger.info('request received to get fragments.');
  const { expand } = req.query;
  logger.debug({ expand });
  let data = await Fragment.byUser(req.user, parseInt(expand));
  logger.debug({ data });
  res.status(200).json(createSuccessResponse({ fragments: data }));
};
