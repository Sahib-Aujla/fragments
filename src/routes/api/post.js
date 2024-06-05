const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');
require('dotenv').config();
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  // TODO: this is just a placeholder. To get something working, return an empty array...
  logger.info('request received at POST');
  logger.debug(req);

  const { type } = contentType.parse(req);
  logger.debug({type});
  if (type!=='text/plain') {
    return res.status(415).json(createErrorResponse(415, 'Invalid type'));
  }
  logger.debug('buffer: ',req.body);
  if (!req.body || !Buffer.isBuffer(req.body) || req.body.length === 0) {
    return res.status(415).json(createErrorResponse(415, 'Invalid data'));
  }

  try {
    const size = parseInt(req.headers['content-length']) || req.body.length;
    logger.debug('type' + type);
    let newFragment = new Fragment({ ownerId: req.user, size, type });
    logger.debug('new Fragment', { newFragment });
    try {
      await newFragment.setData(req.body);
    } catch (error) {
      logger.debug('error saving data', error);
    }
    logger.info(req.headers.host);
    logger.info(process.env.API_URL + '   port');
    let url;
    if (!process.env.API_URL) {
      const host = req.headers.host;
      const protocol = req.protocol || 'http';
      url = `${protocol}://${host}`;
    } else {
      url = process.env.API_URL;
    }
    logger.info('url: ' + url);
    let location;
    try {
      location = new URL('/v1/fragments/' + newFragment.id, url);
    } catch (error) {
      logger.error('location error', { error });
      return res.status(500).json(createErrorResponse(500, 'server error'));
    }

    logger.info('successfully created fragment');
    logger.debug({ location });
    return res
      .status(201)
      .location('location')
      .json(createSuccessResponse({ fragment: newFragment }));
  } catch (error) {
    logger.error('error saving fragment', { error });

    res.status(500).json(createErrorResponse(500, 'Server error: ' + error));
  }
};
