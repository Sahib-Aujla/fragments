// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const markdown = require('markdown-it');
const md = markdown();
// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data/memory');
const logger = require('../logger');

class Fragment {
  static supportedTypes = [
    'text/plain',
    'text/html',
    'text/markdown',
    'text/csv',
    'application/json',
    'application/x-yaml',
  ];
  constructor({
    id,
    ownerId,
    created = new Date().toISOString(),
    updated = new Date().toISOString(),
    type,
    size = 0,
  }) {
    if (!ownerId || !type) {
      logger.debug('here' + ownerId + '  ' + type);
      const val = ownerId ? 'type' : 'ownerId';
      throw new Error(`${val} required`);
    }
    if (!Number.isInteger(size) || size < 0) {
      throw new Error('size must be a valid positive integer');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error('type must be valid');
    }
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;
    return this;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(vOwnerId, vId) {
    // const { id, created, ownerId, updated, type, size } = await readFragment(vOwnerId, vId);
    // return new Fragment({ id, created, ownerId, updated, type, size });

    const resp = await readFragment(vOwnerId, vId);
    if (!resp) {
      throw new Error('Fragment does not exist');
    }
    return resp;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Invalid data type');
    }
    this.size = data.length;
    await this.save();

    return writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns the mime type of the extension:
   * "txt" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  mimeTypeOf(extension) {
    const mType = {
      txt: 'text/plain',
      md: 'text/markdown',
      html: 'text/html',
      csv: 'text/csv',
      json: 'application/json',
      yaml: 'application/x-yaml',
      yml: 'application/x-yaml',
    };
    return mType[extension];
  }

  /**
   * Returns the converted data for the extension:
   * Checks if conversion possible and then converts the data
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {Buffer data}
   */
  async convertData(extension) {
    try {
      const mType = this.mimeTypeOf(extension);
      logger.debug({ mType });

      if (!this.formats.includes(mType)) return null;
      const data = await this.getData();

      if (this.mimeType === 'text/markdown' && extension === 'html')
        return Buffer.from(md.render(data.toString('utf-8')), 'utf-8');

      return data;
    } catch (error) {
      logger.error('Error in convertData method', { error });
      throw new Error('Data conversion failed');
    }
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    const validConversions = {
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
      'text/html': ['text/html', 'text/plain'],
      'text/csv': ['text/csv', 'text/plain', 'application/json'],
      'application/json': ['application/json', 'application/x-yaml', 'text/plain'],
    };
    return validConversions[this.mimeType] || [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    return Fragment.supportedTypes.includes(type);
  }
}

module.exports.Fragment = Fragment;
