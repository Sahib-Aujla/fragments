// src/routes/api/getOne.js

const { createErrorResponse } = require('../../response');

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a single fragment for the current user
 */
module.exports = async (req, res) => {
  const { id } = req.params;
  logger.info(`Request received to get fragment with id: ${id}`);

  try {
    const fragment = await Fragment.byId(req.user, id);
    logger.debug({ fragment });

    const data = await fragment.getData();
    logger.debug({ data });

    return res.status(200).type(fragment.mimeType).send(data);
  } catch (error) {
    logger.error('Error retrieving fragment', { error });
    return res.status(500).json(createErrorResponse(500, 'Error retrieving fragment'));
  }
};
