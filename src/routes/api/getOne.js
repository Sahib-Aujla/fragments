// src/routes/api/getOne.js

const { createErrorResponse } = require('../../response');

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a single fragment for the current user
 */
module.exports = async (req, res) => {
  let { id } = req.params;
  logger.info(`Request received to get fragment with id: ${id}`);
  const nId = id.split('.');
  logger.debug('Id received:', { nId });
  let ext = nId.length === 2 ? nId[1] : undefined;
  id = nId[0];

  try {
    const fragment = await Fragment.byId(req.user, id);
    logger.debug({ fragment });

    if (ext !== undefined) {
      logger.debug('extension: ' + ext);
      try {
        const data = await fragment.convertData(ext);
        if (data !== null) return res.status(200).type(fragment.mimeTypeOf(ext)).send(data);
      } catch (error) {
        logger.error('error converting data', { error });
      }
    }
    logger.debug('Here1');
    const data = await fragment.getData();
    logger.debug('Here2');

    logger.debug({ data });
    logger.debug('Here3');

    return res.status(200).type(fragment.mimeType).send(data);
  } catch (error) {
    logger.error('Error retrieving fragment', { error });
    logger.error(error);

    return res.status(404).json(createErrorResponse(404, 'Error retrieving fragment'));
  }
};
