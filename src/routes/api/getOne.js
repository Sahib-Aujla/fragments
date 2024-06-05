// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  // TODO: this is just a placeholder. To get something working, return an empty array...
  logger.info('request received to get a single fragment.');
  const { id } = req.params;
  logger.debug('received id: ' + id);
  let data = await Fragment.byId(req.user, id);
  logger.debug({ data });
  res.status(200).json(createSuccessResponse({ fragment: data }));
};
