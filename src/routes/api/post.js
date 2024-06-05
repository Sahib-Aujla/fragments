const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');

/**
 * Get a list of fragments for the current user
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

  try {
    const size = parseInt(req.headers['content-length']) || req.body.length;
    logger.debug('type' + type);
    let newFragment = new Fragment({ ownerId: req.user, size, type });
    await newFragment.setData(req.body);
    logger.debug('new Fragment', { newFragment });

    logger.info(req.headers.host);
    logger.info(process.env.API_URL + '   port');
    const url = process.env.API_URL || `${req.protocol || 'http'}://${req.headers.host}`;

    logger.info('url: ' + url);
    let location;

    location = new URL('/v1/fragments/' + newFragment.id, url);

    logger.info('successfully created fragment');
    logger.debug({ location });
    return res
      .status(201)
      .location(location)
      .json(createSuccessResponse({ fragment: newFragment }));
  } catch (error) {
    logger.error('error creating fragment', { error });

    res.status(500).json(createErrorResponse(500, 'Server error: ' + error));
  }
};
