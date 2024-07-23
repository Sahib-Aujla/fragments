const { createSuccessResponse, createErrorResponse } = require('../../response');

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  const { id } = req.params;
  try {
    const fragment = await Fragment.byId(id);
    logger.debug('DELETE: request received to delete fragment: ' + id);
    if (!fragment) {
      return res.send(200).json(createSuccessResponse({ message: 'fragment not found' }));
    }

    await fragment.delete();
    res.send(200).json(createSuccessResponse({ message: 'fragment deleted successfully' }));
  } catch (error) {
    return res.send(404).json(createErrorResponse(404, error));
  }
};
