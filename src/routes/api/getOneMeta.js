// src/routes/api/getOneMeta.js

const { createErrorResponse, createSuccessResponse } = require('../../response');

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a single fragment meta data for the current user
 */
module.exports = async (req, res) => {
  const { id } = req.params;
  logger.info(`Request received to get fragment meta data with id: ${id}`);

  try {
    const fragment = await Fragment.byId(req.user, id);
    logger.debug({ fragment });

    return createSuccessResponse(fragment);
  } catch (error) {
    logger.error('Error retrieving fragment', { error });
    return res.status(500).json(createErrorResponse(500, 'Error retrieving fragment'));
  }
};
