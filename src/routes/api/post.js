const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  // TODO: this is just a placeholder. To get something working, return an empty array...
  logger.info('request received');
  logger.debug(req);

  const { type } = contentType.parse(req);
  if (!type) {
    return res.status(415).json(createErrorResponse(415, 'Invalid type'));
  }

  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Invalid data'));
  }

  try {
    const size = parseInt(req.headers['content-length']) || req.body.length;
    logger.debug('type' + type);
    let newFragment = new Fragment({ ownerId: req.user, size, type });
    logger.debug('new Fragment', { newFragment });
    await newFragment.setData(req.body);

    const url = process.env.API_URL || req.headers.host;
    const location = new URL('/v1/fragments/' + newFragment.id, url);
    if (!location) {
      logger.error('location error', { location });
      return res.status(500).json(createErrorResponse(500, 'server error'));
    }
    logger.info('successfully created fragment');
    logger.debug({ location });

    return res
      .status(201)
      .location(location)
      .json(createSuccessResponse({ fragment: newFragment }));
  } catch (error) {
    logger.error('error saving fragment', { error });

    res.status(500).json(createErrorResponse(500, 'Server error: ' + error));
  }
};
