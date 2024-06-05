// src/routes/api/getOne.js

const { createSuccessResponse, createErrorResponse } = require('../../response');

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a single fragment for the current user
 */
module.exports = async (req, res) => {
  const { id } = req.params;
  logger.info('received id: ' + id);
  logger.info('request received to get a single fragment.');
  let data;
  try {
    data = await Fragment.byId(req.user, id);
  } catch (error) {
    logger.info('error getting one fragment');
    logger.debug({ error });
    return res.status(500).json(createErrorResponse(500, 'error getting fragment'));
  }
  logger.debug({ data });
  return res.status(200).json(createSuccessResponse({ fragment: data }));
};
