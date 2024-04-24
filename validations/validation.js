import db from '../db/dbconfig.js';

/**
 * Validate the request body to ensure it's an array.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} - True if valid, false otherwise
 */
async function validateRequestBody(req, res) {
  const changes = req.body;
  if (!Array.isArray(changes)) {
    res.status(400).json({ error: 'Invalid request body, expected an array' });
    return false;
  }
  return true;
}

/**
 * Validate the length of a noun.
 * @param {string} noun - The noun to validate
 * @returns {string|null} - An error message if the length exceeds 30 characters, otherwise null
 */
async function validateNounLength(noun) {
  if (noun.length > 30) {
    return `Noun "${noun}" exceeds maximum length of 30 characters`;
  }
  return null;
}

// /**
//  * Validate if a noun already exists in the database (case insensitive).
//  * @param {string} noun - The noun to check
//  * @returns {Promise<string|null>} - An error message if the noun already exists, otherwise null
//  */
// async function validateNounExistence(noun) {
//   const existingNoun = await db('nouns')
//     .whereRaw('LOWER(name) = ?', [noun.toLowerCase()])
//     .first();

//   if (existingNoun) {
//     return `Noun '${noun}' already exists (case insensitive)`;
//   }

//   return null;
// }

export { validateRequestBody, validateNounLength};
