const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');

/**
 * Update an existing fragment for the current user
 */
module.exports = async (req, res) => {
  logger.info('request received at POST');
  logger.debug(req);

  const { type } = contentType.parse(req);
  logger.debug({ type });
  if (!Fragment.isSupportedType(type)) {
    return res.status(415).json(createErrorResponse(415, 'Invalid type'));
  }
  logger.debug('buffer: ', req.body);
  if (!req.body || !Buffer.isBuffer(req.body) || req.body.length === 0) {
    return res.status(415).json(createErrorResponse(415, 'Invalid data'));
  }

  const fragmentId = req.params.id;

  try {
    const existingFragment = await Fragment.byId(fragmentId);
    if (!existingFragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    const size = parseInt(req.headers['content-length']) || req.body.length;
    existingFragment.size = size;
    existingFragment.type = type;
    await existingFragment.setData(req.body);
    await existingFragment.save();

    logger.debug('updated Fragment', { existingFragment });

    return res.status(200).json(createSuccessResponse({ fragment: existingFragment }));
  } catch (error) {
    logger.error('error updating fragment', { error });

    res.status(500).json(createErrorResponse(500, 'Server error: ' + error));
  }
};
