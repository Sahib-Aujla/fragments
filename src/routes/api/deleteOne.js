const { createSuccessResponse, createErrorResponse } = require('../../response');

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  const { id } = req.params;
  const ownerid = req.user;

  try {
    logger.debug('DELETE: request received to delete fragment: ' + id + ' ' + ownerid);
    const fragment = await Fragment.byId(ownerid, id);
    if (!fragment) {
      logger.error('Fragment not found: ' + id);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    await Fragment.delete(ownerid, id);

    return res
      .status(200)
      .json(createSuccessResponse({ message: 'Fragment deleted successfully' }));
  } catch (e) {
    logger.error('Error deleting fragment: ' + e);

    return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
